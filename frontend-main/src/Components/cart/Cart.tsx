import React, { useEffect, useState, useRef } from "react";
import { getUserCart, moveCartToOrder } from "../../services/cartService";
import api from "../../services/api";
import { CartItem, MoveCartToOrderRequest } from "../../types/cart";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Snackbar,
  Backdrop,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CartItems from "./CartItems";
import OrderSummary from "./OrderSummary";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cartEvents } from "./cartEvents";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedCardCallback = useRef(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  // JazzCash payment states
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Success overlay
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Failed payment snackbar
  const [failedSnackbar, setFailedSnackbar] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  const subtotal = cart.reduce((sum, item) => sum + item.fee, 0);
  const total = subtotal;

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "#1a472a",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#1a472a",
    },
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userID = localStorage.getItem("userId");
        if (!userID) return;
        const response = await getUserCart(userID);
        setCart(response.data || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userID = localStorage.getItem("userId");
      if (!userID) return;
      const response = await getUserCart(userID);
      setCart(response.data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const handleProceed = () => {
    if (!showPayment) {
      setShowPayment(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleCreateOrderAfterPayment = async (jazzResponse: any, paymentMethod: "card" | "mwallet", overrideAmount?: number) => {
    const userID = localStorage.getItem("userId") || "";
    let orderIds: string[] = [];

    // 1. Create orders from cart
    try {
      const payload: MoveCartToOrderRequest = { userID };
      const response = await moveCartToOrder(payload);
      if (response.success) {
        cartEvents.emit();
        orderIds = response.data
          ? response.data.map((o: any) => o._id || o.orderID)
          : [];
      }
    } catch (error) {
      console.error("Error creating order after payment:", error);
    }

    // 2. Save payment transaction to database
    try {
      const amountToSave = overrideAmount !== undefined ? overrideAmount : total;
      await api.post("/payment-transactions", {
        userID,
        orderIDs: orderIds,
        paymentMethod,
        totalAmount: amountToSave,
        jazzCashResponse: jazzResponse,
      });
      console.log("✅ Payment transaction saved successfully");
    } catch (txnErr: any) {
      console.error("❌ Error saving payment transaction:", txnErr?.response?.data || txnErr.message);
    }
  };

  // Check for successful/failed Card payment callback from URL 
  useEffect(() => {
    if (hasProcessedCardCallback.current) return;

    const responseCode = searchParams.get('pp_ResponseCode');
    const responseMessage = searchParams.get('pp_ResponseMessage');

    if (responseCode) {
      hasProcessedCardCallback.current = true;
      setShowPayment(true);
      setTabValue(0);

      const processCallback = async () => {
        const error = searchParams.get('error');
        const amountStr = searchParams.get('pp_Amount');
        const amount = amountStr ? parseFloat(amountStr) / 100 : 0;

        // Build jazzResponse for DB
        const jazzResponse: any = {};
        searchParams.forEach((value, key) => {
          jazzResponse[key] = value;
        });

        const pendingCartOrder = localStorage.getItem('pendingCartOrder');
        if (pendingCartOrder === 'true') {
          localStorage.removeItem('pendingCartOrder');

          if (!error && responseCode === '000') {
            // Payment success
            setShowSuccessOverlay(true);
            setTimeout(() => {
              setShowSuccessOverlay(false);
              navigate("/home-baraka");
            }, 5000);

            await handleCreateOrderAfterPayment(jazzResponse, "card", amount);
          } else {
            // Payment failed
            const failMsg = responseMessage || "Payment Failed.";
            setFailedSnackbar({ open: true, message: failMsg });

            setTimeout(() => {
              setFailedSnackbar({ open: false, message: "" });
            }, 5000);

            try {
              await api.post("/payment-transactions", {
                userID: localStorage.getItem("userId") || "",
                orderIDs: [],
                paymentMethod: "card",
                totalAmount: amount,
                jazzCashResponse: jazzResponse,
              });
              console.log("✅ Failed card payment transaction saved");
            } catch (err) {
              console.error("error saving fail txn:", err);
            }
          }
        }

        // Clean URL to prevent re-triggering
        navigate('/user/cart', { replace: true });
      };

      processCallback();
    }
  }, [searchParams, navigate]);

  const handlePayment = async (paymentType: "card" | "mwallet") => {
    setLoading(true);
    setError(null);

    if (total <= 0) {
      setError("Cart is empty. Please add items before paying.");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        paymentType === "card"
          ? `${API_BASE_URL}/api/payment/card`
          : `${API_BASE_URL}/api/payment/mwallet`;

      const payload: any = {
        amount: total,
        customerName: "Guest Customer",
        customerEmail: "guest@example.com",
        customerPhone: customerPhone,
        description: "Cart Payment",
        billReference: `CART${Date.now()}`,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse backend response JSON:", e);
        setError("System Error: Invalid response from server");
        setLoading(false);
        return;
      }

      if (!response.ok || !data.success) {
        console.error("Payment failed response:", data);
        const errorMsg =
          data.error ||
          (data.data && data.data.pp_ResponseMessage) ||
          "Payment initiation failed";
        throw new Error(errorMsg);
      }

      if (paymentType === "mwallet") {
        const jazzResponse = data.data;
        if (jazzResponse && jazzResponse.pp_ResponseCode === "000") {
          // Payment success
          setLoading(false);

          // Create order & save transaction FIRST (before unmounting)
          await handleCreateOrderAfterPayment(jazzResponse, "mwallet");

          // Show animated success overlay
          setShowSuccessOverlay(true);

          // Auto-hide after 5 seconds and redirect
          setTimeout(() => {
            setShowSuccessOverlay(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            navigate("/home-baraka");
          }, 5000);
        } else {
          setLoading(false);

          // Show auto-hiding failed popup
          const failMsg =
            jazzResponse?.pp_ResponseMessage ||
            "Payment Failed. Please try again.";
          setFailedSnackbar({ open: true, message: failMsg });

          // Auto-hide after 5 seconds
          setTimeout(() => {
            setFailedSnackbar({ open: false, message: "" });
          }, 5000);

          // Save failed payment transaction too
          try {
            await api.post("/payment-transactions", {
              userID: localStorage.getItem("userId") || "",
              orderIDs: [],
              paymentMethod: "mwallet",
              totalAmount: total,
              jazzCashResponse: jazzResponse || {},
            });
            console.log("✅ Failed payment transaction saved:");
          } catch (txnErr: any) {
            console.error("❌ Error saving failed payment transaction:", txnErr?.response?.data || txnErr.message);
          }
        }
      } else {
        // Card Payment - Hosted Payment Page Redirect
        if (data.postUrl && data.formFields) {
          // Before redirecting, store cart order info so callback can create orders
          localStorage.setItem("pendingCartOrder", "true");

          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.postUrl;

          Object.entries(data.formFields).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }

        const jazzResponse = data.data;
        const resMsg =
          jazzResponse?.responseMessage ||
          jazzResponse?.pp_ResponseMessage ||
          data.error ||
          "Payment Failed";
        setError(resMsg);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };



  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4, md: 8 },
        width: "87%",
        margin: "0 auto",
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 5, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0b0b2e" }}>
          {showPayment ? "Payment" : "Cart"}
        </Typography>
        {!showPayment && (
          <Typography sx={{ color: "gray", fontSize: "1rem", fontWeight: 900 }}>
            {cart.length} ITEMS
          </Typography>
        )}
      </Box>

      <Grid
        container
        spacing={6}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          {!showPayment ? (
            <CartItems cartItems={cart} onItemRemoved={fetchCart} />
          ) : (
            /* JazzCash Payment Section */
            <Box>
              {/* Back Button */}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setShowPayment(false);
                  setError(null);
                }}
                sx={{
                  textTransform: "none",
                  color: "#0b8a47",
                  fontWeight: 600,
                  mb: 3,
                  "&:hover": { backgroundColor: "#e6f5ec" },
                }}
              >
                Back to Cart
              </Button>

              <Paper
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.98)",
                }}
              >


                {/* Error Alert */}
                {error && (
                  <Box sx={{ px: 3, pt: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  </Box>
                )}

                {/* Tabs */}
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      py: 2,
                      fontWeight: 600,
                    },
                    "& .Mui-selected": {
                      color: "#1a472a !important",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#1a472a",
                    },
                  }}
                >
                  <Tab
                    icon={<CreditCardIcon />}
                    iconPosition="start"
                    label="Card Payment"
                  />
                  <Tab
                    icon={<AccountBalanceWalletIcon />}
                    iconPosition="start"
                    label="Wallet Payment"
                  />
                </Tabs>

                {/* Card Payment Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Box
                    component="div"
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* How to pay instructions */}
                    <Box
                      sx={{
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        p: 2,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ mb: 1 }}
                      >
                        How to pay:
                      </Typography>
                      <Box
                        component="ol"
                        sx={{
                          m: 0,
                          pl: 2.5,
                          "& li": {
                            mb: 0.5,
                            color: "text.secondary",
                            fontSize: "0.875rem",
                          },
                        }}
                      >
                        <li>
                          Click "Pay" to be redirected to the JazzCash secure
                          payment page
                        </li>
                        <li>Enter your Card Details on the JazzCash page</li>
                        <li>Complete the transaction securely</li>
                      </Box>
                    </Box>


                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handlePayment("card")}
                      disabled={loading || total <= 0}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        background:
                          "linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #15372a 0%, #244a35 100%)",
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Pay PKR ${total.toLocaleString()} with Card`
                      )}
                    </Button>
                  </Box>
                </TabPanel>

                {/* Wallet Payment Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Box
                    component="div"
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {/* How to pay instructions */}
                    <Box
                      sx={{
                        bgcolor: "#f8f9fa",
                        borderRadius: 2,
                        p: 2,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ mb: 1 }}
                      >
                        How to pay:
                      </Typography>
                      <Box
                        component="ol"
                        sx={{
                          m: 0,
                          pl: 2.5,
                          "& li": {
                            mb: 0.5,
                            color: "text.secondary",
                            fontSize: "0.875rem",
                          },
                        }}
                      >
                        <li>
                          Click "Pay" to be redirected to the JazzCash secure
                          payment page
                        </li>
                        <li>Enter your JazzCash Mobile Number</li>
                        <li>
                          Follow the instructions to complete the payment
                        </li>
                      </Box>
                    </Box>

                    <TextField
                      fullWidth
                      label="JazzCash Mobile Number"
                      placeholder="03XXXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      sx={{ ...inputStyles }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handlePayment("mwallet")}
                      disabled={loading || total <= 0}
                      sx={{
                        mt: 1,
                        py: 1.5,
                        background:
                          "linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #15372a 0%, #244a35 100%)",
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Pay PKR ${total.toLocaleString()}`
                      )}
                    </Button>
                  </Box>
                </TabPanel>

                {/* Secure Footer */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f5f5f5",
                    borderTop: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    🔒 Secure payment powered by JazzCash
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }} marginTop={7.5}>
          <OrderSummary
            subtotal={subtotal}
            total={total}
            onProceed={handleProceed}
            loading={loading}
            buttonText={
              showPayment ? "Paying..." : "Proceed to Checkout"
            }
            hideButton={showPayment}
          />
        </Grid>
      </Grid>

      {/* ✅ Animated Success Overlay */}
      <Backdrop
        open={showSuccessOverlay}
        sx={{
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            animation: "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "@keyframes popIn": {
              "0%": { transform: "scale(0.3)", opacity: 0 },
              "50%": { transform: "scale(1.05)" },
              "70%": { transform: "scale(0.95)" },
              "100%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        >
          {/* Animated checkmark circle */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(76, 175, 80, 0.5)",
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%": { boxShadow: "0 0 20px rgba(76, 175, 80, 0.4)" },
                "50%": { boxShadow: "0 0 50px rgba(76, 175, 80, 0.7)" },
                "100%": { boxShadow: "0 0 20px rgba(76, 175, 80, 0.4)" },
              },
            }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 70, color: "#fff" }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 800,
              textAlign: "center",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            Thank you!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              fontSize: "1.1rem",
              mt: 1,
              px: { xs: 2, sm: 6 },
            }}
          >
            {cart.some(item => item.service === "Quran Khawani")
              ? "Thank you! Your Quran Khwani request is being processed. We will email you with joining details of the event shortly."
              : "Your Baraka request is being processed. We will update you as soon as our esteemed scholar addresses it."}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.5)",
              mt: 1,
            }}
          >
            Redirecting to home...
          </Typography>
        </Box>
      </Backdrop>

      {/* ❌ Failed Payment Snackbar - auto hides */}
      <Snackbar
        open={failedSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setFailedSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setFailedSnackbar({ open: false, message: "" })}
          severity="error"
          variant="filled"
          icon={<ErrorOutlineIcon />}
          sx={{
            width: "100%",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {failedSnackbar.message || "Payment Failed."} — Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;
