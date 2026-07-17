import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Radio,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPayment from "./AddPayment";
import { getUserCards, deleteUserCard } from "../../services/userCardService";
import { UserCard } from "../../types/userCard";

interface PaymentProps {
  onBack: () => void;
  userID: string;
}

const Payment: React.FC<PaymentProps> = ({ onBack, userID }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch payment methods from backend (wrapped in useCallback)
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const data = await getUserCards(userID);
      setPaymentMethods(data);

      // ✅ Auto-select first card if available
      if (data.length > 0) {
        setSelected(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  }, [userID]);

  // ✅ Delete card and refresh UI
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteUserCard(id);
        setPaymentMethods((prev) => prev.filter((card) => card._id !== id));

        // Auto-select the first remaining card
        setSelected(() => {
          const updated = paymentMethods.filter((card) => card._id !== id);
          return updated.length > 0 ? updated[0]._id : null;
        });
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    },
    [paymentMethods]
  );

  // ✅ Effect to load cards once userID changes
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto",
        backgroundColor: "#fff",
        p: { xs: 0, sm: 0, md: 0 },
      }}
    >
      {/* 🔙 Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          if (showAddPayment) setShowAddPayment(false);
          else onBack();
        }}
        sx={{
          textTransform: "none",
          color: "#0b8a47",
          fontWeight: 600,
          mb: 3,
          "&:hover": { backgroundColor: "#e6f5ec" },
        }}
      >
        {showAddPayment ? "Back to Payment Methods" : "Back to Cart"}
      </Button>

      {/* Conditional Rendering */}
      {!showAddPayment ? (
        <>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "gray", mb: 2 }}
          >
            Payment Method
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : paymentMethods.length === 0 ? (
            <Typography sx={{ color: "gray", textAlign: "center", mt: 2 }}>
              No payment methods found.
            </Typography>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {paymentMethods.map((method, index) => (
                <Box
                  key={method._id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1, sm: 0 },
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                    borderBottom:
                      index < paymentMethods.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                  }}
                >
                  {/* Left side: radio + logo + text */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Radio
                      checked={selected === method._id}
                      onChange={() => setSelected(method._id)}
                      sx={{
                        color: "#0b8a47",
                        "&.Mui-checked": { color: "#0b8a47" },
                      }}
                    />
                    <Box
                      component="img"
                      src={
                        method.cardNumber.startsWith("5")
                          ? "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                          : "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                      }
                      alt="Card Logo"
                      sx={{ width: 40, height: 25 }}
                    />
                    <Typography sx={{ fontWeight: 500, color: "#0b0b2e" }}>
                      •••• {method.cardNumber.slice(-4)}
                    </Typography>
                    <Typography sx={{ color: "gray", ml: 2 }}>
                      Expires {method.expiryDate}
                    </Typography>
                  </Box>

                  {/* Right side: remove */}
                  <Button
                    variant="text"
                    sx={{
                      color: "red",
                      textTransform: "none",
                      fontWeight: 500,
                      alignSelf: { xs: "flex-end", sm: "auto" },
                    }}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => handleDelete(method._id)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Add Payment Method Button */}
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowAddPayment(true)}
            sx={{
              textTransform: "none",
              color: "#1db954",
              fontWeight: 600,
            }}
          >
            Add Payment method
          </Button>
        </>
      ) : (
        <AddPayment />
      )}
    </Box>
  );
};

export default Payment;
