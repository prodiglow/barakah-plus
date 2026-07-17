/**
 * Live sandbox test of the Alfalah service module:
 *  1. initiateAlfalahPayment() — handshake + SSO payload via the real service code
 *  2. POST the SSO form server-side to confirm APG accepts the RequestHash
 *  3. inquireOrderStatus() — IPN inquiry for the (unpaid) test order
 *
 * Run: npx ts-node src/scripts/testAlfalahFlow.ts
 */
import { initiateAlfalahPayment, inquireOrderStatus } from '../services/alfalah.service';

async function main() {
  console.log('=== 1. Initiate (handshake + SSO payload) ===');
  const result = await initiateAlfalahPayment(10, '3');
  if (!result.success) {
    console.error('❌ Initiation failed:', result.error);
    process.exit(1);
  }
  console.log('✅ Handshake OK. txnRefNo:', result.txnRefNo);
  console.log('   postUrl:', result.postUrl);

  console.log('\n=== 2. POST SSO form (simulating the browser redirect) ===');
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(result.formFields as Record<string, string>)) {
    body.append(k, v);
  }
  const ssoRes = await fetch(result.postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    redirect: 'manual',
  });
  const html = await ssoRes.text();
  const lower = html.toLowerCase();
  const invalid = lower.includes('invalid request') || lower.includes('invalid hash');
  console.log(`HTTP ${ssoRes.status}; location: ${ssoRes.headers.get('location') || '-'}`);
  console.log(`Response length: ${html.length} chars`);
  if (invalid) {
    console.error('❌ APG rejected the SSO request (invalid request/hash)');
    console.log(html.slice(0, 500));
    process.exit(1);
  }
  const looksLikeCheckout =
    lower.includes('checkout') || lower.includes('payment') || lower.includes('card') ||
    ssoRes.status === 302 || ssoRes.status === 200;
  console.log(looksLikeCheckout ? '✅ APG accepted the SSO request' : '⚠️ Unclear response — inspect manually');
  console.log('--- first 400 chars of response ---');
  console.log(html.slice(0, 400).replace(/\s+/g, ' '));

  console.log('\n=== 3. IPN status inquiry for the test order ===');
  try {
    const status = await inquireOrderStatus(result.txnRefNo);
    console.log('✅ IPN reachable. Response:', JSON.stringify(status, null, 2));
  } catch (e: any) {
    console.log('⚠️ IPN inquiry error (may be expected for an unpaid order):', e.message);
  }
}

main().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
