import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    MenuItem,
    CircularProgress,
    Alert,
} from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Bank Alfalah APG test page.
 * All credentials and hashing live on the backend — this page only requests
 * an SSO form payload and auto-submits it to the APG hosted checkout.
 */
const AlfalahCheckout: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactionAmount, setTransactionAmount] = useState<string>("10");
    const [transactionTypeId, setTransactionTypeId] = useState<string>("3");

    const handlePay = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/alfalah/initiate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(transactionAmount),
                    transactionTypeId,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.postUrl || !data.formFields) {
                throw new Error(data.error || "Payment initiation failed");
            }

            // Auto-submit hidden form to the APG hosted payment page
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
        } catch (err: any) {
            console.error("Alfalah initiation error:", err);
            setError(err.message || "An error occurred");
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                    Bank Alfalah Payment Test
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <TextField
                        label="Transaction Amount (PKR)"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        fullWidth
                        type="number"
                    />
                    <TextField
                        select
                        label="Transaction Type"
                        value={transactionTypeId}
                        onChange={(e) => setTransactionTypeId(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="1">Alfa Wallet</MenuItem>
                        <MenuItem value="2">Alfalah Bank Account</MenuItem>
                        <MenuItem value="3">Credit/Debit Card</MenuItem>
                    </TextField>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handlePay}
                        disabled={loading || !transactionAmount || parseFloat(transactionAmount) <= 0}
                        fullWidth
                        size="large"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Pay with Bank Alfalah"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AlfalahCheckout;
