# Bank Alfalah APG Integration Plan — Barakah Plus

Based on: APG Merchant Integration Guide v1.1, Bank Alfalah sample PHP code (handshake + IPN),
the APG Integration Plan v2 document, and the existing JazzCash integration in this repo.

## 1. How APG works (the full flow)

APG is a **hosted checkout** — card/wallet details are entered on Bank Alfalah's page, never ours.
Three payment methods, all via redirection: Alfa Wallet (TransactionTypeId=1), Alfalah Bank
Account (=2), Credit/Debit Card (=3).

```
User clicks "Pay with Alfalah"
        │
        ▼
[1] Backend: HANDSHAKE  POST https://sandbox.bankalfalah.com/HS/HS/HS
    form-urlencoded, HS_IsRedirectionRequest=0 (server-to-server, returns JSON)
    body: HS_ChannelId=1001, HS_MerchantId, HS_StoreId, HS_ReturnURL,
          HS_MerchantHash, HS_MerchantUsername, HS_MerchantPassword,
          HS_TransactionReferenceNumber (our OrderID), HS_RequestHash
    ← { "success": "true", "AuthToken": "...", "ReturnURL": "..." }
        │
        ▼
[2] Backend → Frontend: SSO redirect payload
    Frontend auto-submits a hidden form POST to
    https://sandbox.bankalfalah.com/SSO/SSO/SSO with:
    AuthToken, RequestHash, ChannelId=1001, Currency=PKR, IsBIN=0,
    ReturnURL, MerchantId, StoreId, MerchantHash, MerchantUsername,
    MerchantPassword, TransactionTypeId=3, TransactionReferenceNumber,
    TransactionAmount
        │
        ▼
[3] Customer pays on Bank Alfalah's hosted page
        │
        ▼
[4] APG redirects customer to our ReturnURL with result appended, e.g.
    <ReturnURL>/TS=P/RC=00/RD=/O=<OrderID>     (TS=P → paid, RC=00 → success)
        │
        ▼
[5] Backend: VERIFY (never trust the redirect alone) — IPN status inquiry:
    GET https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/{MerchantId}/{StoreId}/{OrderID}
    ← JSON with TransactionStatus: "Paid" | "Failed", TransactionId,
      TransactionAmount, TransactionReferenceNumber ...
    Mark order Paid ONLY on TransactionStatus === "Paid"
        │
        ▼
[6] Optional but recommended: Listener URL webhook.
    APG POSTs  <listener>?url=https://.../HS/api/IPN/OrderStatus/{mid}/{sid}/{oid}
    Our endpoint GETs that url and updates the order — covers the case where
    the customer closes the browser before returning.
    ⚠ Listener URL must be whitelisted by the APG account manager before it fires.
```

### The RequestHash (both steps)

Every request carries a hash proving no tampering:

1. Concatenate the fields as `key=value&key=value...` in the **exact same order as they
   appear in the request** (order matters — the hash is compared against the posted fields).
   Official sample order for the handshake:
   `HS_ChannelId, HS_IsRedirectionRequest, HS_MerchantId, HS_StoreId, HS_ReturnURL,
    HS_MerchantHash, HS_MerchantUsername, HS_MerchantPassword, HS_TransactionReferenceNumber`
   For the SSO step:
   `AuthToken, RequestHash(empty), ChannelId, Currency, IsBIN, ReturnURL, MerchantId,
    StoreId, MerchantHash, MerchantUsername, MerchantPassword, TransactionTypeId,
    TransactionReferenceNumber, TransactionAmount`
2. Encrypt with **AES-128-CBC, PKCS7 padding**: Key1 = cipher key, Key2 = IV
   (both 16 chars, provided by the bank), then **base64-encode**.

Node.js equivalent:
```ts
import crypto from "crypto";
function generateRequestHash(mapString: string): string {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(process.env.ALFALAH_KEY1!, "utf8"),
    Buffer.from(process.env.ALFALAH_KEY2!, "utf8")
  );
  return Buffer.concat([cipher.update(mapString, "utf8"), cipher.final()]).toString("base64");
}
```

## 2. What's wrong with the current attempt

`frontend-main/src/pages/AlfalahCheckout.tsx` does the whole flow **in the browser**:
- Key1/Key2 and merchant username/password would ship to every visitor (credential leak).
- The handshake fetch from the browser hits CORS (the code even comments this).
- Payment success is decided client-side with no server verification.

**All crypto and credentials move to the backend.** The frontend only receives a ready-made
SSO form payload and auto-submits it — same division of labor as the JazzCash card flow.

## 3. Implementation plan (mirrors the JazzCash module)

### Backend — new files
| File | Contents |
|---|---|
| `backend/src/config/alfalah.config.ts` | env-driven config + sandbox/production URLs (`sandbox.bankalfalah.com` / `payments.bankalfalah.com`), `validateConfig()` |
| `backend/src/utils/alfalah.hash.utils.ts` | `generateRequestHash()` (AES-128-CBC PKCS7 → base64), map-string builders for handshake + SSO |
| `backend/src/services/alfalah.service.ts` | `initiateHandshake()` (axios POST form-urlencoded, returns AuthToken), `buildSSOPayload()`, `inquireOrderStatus(orderId)` (IPN GET) |
| `backend/src/controllers/alfalahController.ts` | `initiatePayment`, `handleReturn` (parse TS/RC/O, verify via IPN, update order, redirect to frontend result page), `handleListener` (webhook), `getOrderStatus` |
| `backend/src/routes/alfalahRoutes.ts` | mounted at `/api/alfalah` |

### Endpoints
- `POST /api/alfalah/initiate` (protected) — body `{ orderId, amount, transactionTypeId }` →
  handshake → returns `{ ssoUrl, fields }` for the frontend form.
- `GET/POST /api/alfalah/return` — APG ReturnURL. Parses `TS`/`RC`/`O` (note: APG appends them
  as **path segments** `.../TS=P/RC=00/RD=/O=A10`, so also register a wildcard route), calls the
  IPN status inquiry, updates `Orders.PaymentStatus` + creates a `PaymentTransaction` record,
  302-redirects to `FRONTEND_URL/payment/alfalah-callback?...`.
- `POST /api/alfalah/listener` — the whitelisted Listener URL; reads `url` query param,
  GETs it, updates the order idempotently.
- `GET /api/alfalah/status/:orderId` — manual re-check, same IPN inquiry.

### Order marking (single source of truth)
One idempotent function `markOrderPaidFromIPN(ipnResponse)` used by return handler, listener,
and manual status check: match `TransactionReferenceNumber` → order, set
`PaymentStatus: "Paid"` only when `TransactionStatus === "Paid"`, store the full IPN payload in
`PaymentTransaction` (add `gateway: "alfalah" | "jazzcash"` field), never double-fire emails.

### Frontend
- Rewrite `AlfalahCheckout.tsx`: call `POST /api/alfalah/initiate`, then render + auto-submit
  the hidden SSO form from the response. No CryptoJS, no credentials.
- Keep `AlfalahCallback.tsx` as the result page; drive it from our backend redirect params
  (verified status), not raw gateway params.
- Add Alfalah as a payment option in `Checkout.tsx` next to JazzCash.

### Environment variables (add to `backend/.env.example`)
```
ALFALAH_ENVIRONMENT=sandbox            # sandbox | production
ALFALAH_MERCHANT_ID=
ALFALAH_STORE_ID=
ALFALAH_CHANNEL_ID=1001
ALFALAH_MERCHANT_HASH=
ALFALAH_MERCHANT_USERNAME=
ALFALAH_MERCHANT_PASSWORD=
ALFALAH_KEY1=                          # 16-char AES key (emailed by bank)
ALFALAH_KEY2=                          # 16-char AES IV  (emailed by bank)
ALFALAH_RETURN_URL=                    # public https URL of /api/alfalah/return
```

## 4. What YOU need to obtain from Bank Alfalah (blockers)

1. **Merchant account** — sign up at https://merchants.bankalfalah.com/merchantsignup,
   accept the service agreement, then log in to the Merchant Portal.
2. **Sandbox credentials** — Portal → Go Live → Access Sandbox → Credentials Generate:
   Merchant ID, Store ID, Merchant Hash, Username, Password. **Key1/Key2 arrive by email.**
3. **Configure Return URL + Listener URL** in the sandbox dashboard.
4. **Whitelisting** — send the Listener URL to the APG account manager (required before IPN
   webhooks fire).
5. **Test cards** — provided inside the sandbox portal.
6. At go-live: Portal → Go Live → Step 2 → Generate production credentials; production
   Key1/Key2 come from the APG business owner; repeat URL configuration + whitelisting.

## 5. Gotchas (from the docs + sample code)

- **Hash field order must match the posted field order exactly** — mismatch = "Invalid Request".
- Strip the trailing `&` from the map string before encrypting.
- `HS_IsRedirectionRequest=0` for server-side handshake (JSON response); `1` is the
  browser-redirection variant — don't mix the two.
- The return redirect appends result as **path segments** (`/TS=P/RC=00/RD=/O=x`), not a normal
  query string — parse accordingly.
- **Never trust the redirect**: always confirm via the IPN OrderStatus GET before marking paid.
- `TransactionReferenceNumber` must be unique per attempt — reuse of a reference for a retried
  payment can be rejected; suffix retries (e.g. `1234-2`).
- AuthToken is short-lived — do handshake + SSO submit in one user action, don't cache it.
- Vercel note: the backend is serverless — fine for all these endpoints, but the Listener URL
  must be the **production** backend URL and stable (no preview URLs).

## BUILD STATUS (2026-07-12) — implemented & sandbox-verified

The integration is **built and live-tested against the APG sandbox** (merchant 260744 / store
555152). Handshake → SSO redirect → IPN inquiry all confirmed working with the real gateway.

Files added: `backend/src/{config/alfalah.config,utils/alfalah.hash.utils,services/alfalah.service,
controllers/alfalahController,routes/alfalahRoutes,types/alfalah.types}.ts`; routes mounted at
`/api/alfalah`. Frontend: third "Bank Alfalah" tab in `componentsnew/Checkout.tsx`, rewritten
`pages/AlfalahCheckout.tsx` (backend-driven) and `pages/AlfalahCallback.tsx` (verified-status result page).

A 22-agent adversarial review was run and its confirmed findings fixed:
- **Listener forgery closed** — the IPN listener now re-derives only the order ref from the callback
  URL, re-inquires through our own config-built URL, and rejects any status whose MerchantId/StoreId
  don't match our merchant. (Previously it trusted the attacker-supplied full URL.)
- **IPN status interpreted properly** — `interpretOrderStatus()` distinguishes paid / failed /
  pending / inquiry-error using both ResponseCode and TransactionStatus, so an "Order Not Found"
  or in-flight status is shown as *pending* (new UI state), never a false "failed" that would
  discard the order.
- **Return handler hardened** — per-segment decode is crash-safe (stray `%`); the route uses a
  regex to avoid Express 5's splat-param decode throw.
- **PII removed** from the public `GET /api/alfalah/status/:ref` response (no AccountNumber/MobileNumber).
- **Callback parity** — unknown status now persists as *Pending* (not a forced Failed), matching JazzCash.
- **Honest UI copy** — the card tab no longer advertises wallet/bank-account (we submit TransactionTypeId=3).

### Known limitation (shared with the existing JazzCash flow — not yet changed)
`PaymentTransaction` rows are still created **client-side** from the return page, and only when a
`userId` exists in localStorage. So a **guest** checkout (the `/checkout1` route is public) or a
customer who closes the browser on the bank page can be charged with no server-side transaction
record, and the IPN listener then has nothing to update. Closing this properly needs either
(a) persisting a `Pending` transaction server-side at `/initiate` time (requires relaxing the
model's `userID: required` for guests), or (b) requiring login before checkout. Recommended as a
follow-up because it touches the shared payment model and the guest-checkout product decision.

## 6. Sequencing (matches the bank's own 11-day plan)

1. **Day 1** — obtain sandbox credentials, configure portal URLs (user action).
2. **Days 1–3** — backend module (config, hash utils, service, controller, routes) + unit-test
   the hash against the CryptoJS sample output from the guide.
3. **Day 3–4** — frontend checkout rewrite + result page.
4. **Days 5–6** — sandbox E2E with test cards: paid, failed, user-abandons (listener path).
5. **Days 7–8** — UAT on staging; verify orders flip to Paid in the admin dashboard.
6. **Day 9+** — production credentials, whitelisting, smoke test with a real card.
