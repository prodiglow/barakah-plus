import React, { useState } from "react";
import {
  Box,
  Typography,
  Radio,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useAlertDialog } from "../../context/AlertDialogContext";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const AddPayment: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const [errors, setErrors] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  // ✅ Card number — only digits, max 16
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 16) {
      setCardNumber(value);
      setErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  // ✅ Expiry auto-format: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiry(value);
      setErrors((prev) => ({ ...prev, expiry: "" }));
    }
  };

  // ✅ CVV — only 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvv(value);
      setErrors((prev) => ({ ...prev, cvv: "" }));
    }
  };

  // ✅ Name — only alphabets and spaces allowed
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters and spaces
    if (/^[A-Za-z ]*$/.test(value)) {
      setName(value);
      setErrors((prev) => ({ ...prev, name: "" })); // instantly clear red border
    }
  };

  // ✅ Final validation before saving
  const handleSave = async () => {
    const newErrors = { cardNumber: "", expiry: "", cvv: "", name: "" };
    let valid = true;

    if (cardNumber.length < 14) {
      newErrors.cardNumber = "Enter a valid card number";
      valid = false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Invalid expiry (MM/YY)";
      valid = false;
    }

    if (cvv.length !== 3) {
      newErrors.cvv = "CVV must be 3 digits";
      valid = false;
    }

    if (name.trim().length < 3) {
      newErrors.name = "Enter a valid name";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      await showAlert('Success', "Payment details saved successfully!", 'success');
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: -6 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        How would you like to pay?
      </Typography>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          p: 3,
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Radio checked />
          <CreditCardIcon sx={{ mr: 1 }} />
          <Typography sx={{ fontWeight: 600 }}>Credit Card</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
            alt="visa"
            sx={{ height: 16, mx: 0.5 }}
          />
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
            alt="mastercard"
            sx={{ height: 16, mx: 0.5 }}
          />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>+4</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          All fields are required unless marked otherwise.
        </Typography>

        <TextField
          label="Card number"
          fullWidth
          variant="outlined"
          value={cardNumber}
          onChange={handleCardNumberChange}
          error={!!errors.cardNumber}
          helperText={errors.cardNumber}
          InputProps={{
            endAdornment: <CreditCardIcon color="disabled" />,
            inputMode: "numeric",
          }}
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            display: "flex",
            mb: 2,
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
            alt="visa"
            sx={{ height: 16, mx: 0.5 }}
          />
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
            alt="mastercard"
            sx={{ height: 16, mx: 0.5 }}
          />
          <Box
            component="img"
            src="data:image/png;base64,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"
            alt="amex"
            sx={{ height: 16, mx: 0.5 }}
          />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>+3</Typography>
        </Box>


        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              label="Expiry date"
              placeholder="MM/YY"
              fullWidth
              variant="outlined"
              value={expiry}
              onChange={handleExpiryChange}
              error={!!errors.expiry}
              helperText={errors.expiry || "Front of card in MM/YY format"}
              InputProps={{
                inputMode: "numeric",
                endAdornment: <CreditCardIcon color="disabled" />,
              }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              label="Security code"
              placeholder="CVC"
              fullWidth
              variant="outlined"
              value={cvv}
              onChange={handleCvvChange}
              error={!!errors.cvv}
              helperText={errors.cvv || "3 digits on back of card"}
              InputProps={{
                inputMode: "numeric",
                endAdornment: <CreditCardIcon color="disabled" />,
              }}
            />
          </Grid>
        </Grid>


        {/* ✅ Name with alphabet-only validation */}
        <TextField
          label="Name on card"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mt: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#0b0b2e",
            color: "#fff",
            textTransform: "none",
            borderRadius: 2,
            py: 1.3,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#151542",
            },
          }}
          onClick={handleSave}
        >
          <LockOutlinedIcon sx={{ mr: 1, fontSize: 20 }} />
          Save details
        </Button>
      </Paper>
    </Box>
  );
};

export default AddPayment;
