import React from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import moment from "moment";

interface Props {
  subtotal: number;
  total: number;
  onProceed: () => void;
  buttonText?: string;
  loading?: boolean;
  hideButton?: boolean;
}

const OrderSummary: React.FC<Props> = ({
  subtotal,
  total,
  onProceed,
  buttonText,
  loading,
  hideButton,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #e0e0e0",
        borderRadius: 1.5,
        p: { md: 3, sm: 2, xs: 2 },
        width: "90%",
        height: "350px", // Reduced height since coupon elements are removed
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b0b2e", mb: 2 }}>
        Order Summary
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography color="text.secondary">Price</Typography>
        <Typography fontWeight={600}>PKR. {subtotal}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography fontWeight={700}>TOTAL</Typography>
        <Typography fontWeight={700}>PKR. {total.toFixed(0)}</Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography color="text.secondary">Estimated Delivery by</Typography>
        <Typography fontWeight={700}>
          {moment().add(5, "days").format("DD MMM, YYYY")}
        </Typography>
      </Box>

      {!hideButton && (
        <Button
          disabled={total === 0 || loading}
          fullWidth
          variant="contained"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            onProceed();
          }}
          sx={{
            textTransform: "none",
            backgroundColor: "#0b8a47",
            color: "#fff",
            py: 1.2,
            borderRadius: 1.5,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#06a14a",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            buttonText || "Proceed to Checkout"
          )}
        </Button>
      )}
    </Paper>
  );
};

export default OrderSummary;
