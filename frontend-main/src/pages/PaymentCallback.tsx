import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useCart } from '../context/CartContext';
import { moveCartToOrder } from '../services/cartService';
import { MoveCartToOrderRequest } from '../types/cart';
import { cartEvents } from '../Components/cart/cartEvents';
import api from '../services/api';

const PaymentCallback: React.FC = () => {
    const { clearCart } = useCart() as { clearCart: () => void };
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'unknown'>('unknown');
    const [paymentDetails, setPaymentDetails] = useState<{
        responseCode?: string;
        responseMessage?: string;
        txnRefNo?: string;
        amount?: string;
        orderIds?: string[];
    }>({});

    useEffect(() => {
        const processPayment = async () => {
            // Extract payment parameters from URL
            const responseCode = searchParams.get('pp_ResponseCode');
            const responseMessage = searchParams.get('pp_ResponseMessage');
            const txnRefNo = searchParams.get('pp_TxnRefNo');
            const amount = searchParams.get('pp_Amount');
            const error = searchParams.get('error');

            const details: any = {
                responseCode: responseCode || undefined,
                responseMessage: responseMessage || undefined,
                txnRefNo: txnRefNo || undefined,
                amount: amount || undefined,
            };

            // Determine payment status
            console.log('Processing payment callback');
            if (error) {
                setPaymentStatus('failed');
            } else if (responseCode === '000') {
                setPaymentStatus('success');
                clearCart();

                // Check if this was a cart payment and create orders
                const pendingCartOrder = localStorage.getItem('pendingCartOrder');
                if (pendingCartOrder === 'true') {
                    localStorage.removeItem('pendingCartOrder');
                    try {
                        const payload: MoveCartToOrderRequest = {
                            userID: localStorage.getItem('userId') || '',
                        };
                        const response = await moveCartToOrder(payload);
                        if (response.success) {
                            cartEvents.emit();
                            details.orderIds = response.data
                                ? response.data.map((o: any) => o._id || o.orderID)
                                : [];
                        }
                    } catch (err) {
                        console.error('Error creating orders from cart:', err);
                    }
                }
            } else if (responseCode) {
                setPaymentStatus('failed');
                localStorage.removeItem('pendingCartOrder');
            } else {
                setPaymentStatus('unknown');
            }

            setPaymentDetails(details);

            // Save payment transaction to database
            const userID = localStorage.getItem('userId') || '';
            try {
                // Build jazzCash response from all search params
                const jazzCashResponse: any = {};
                searchParams.forEach((value, key) => {
                    jazzCashResponse[key] = value;
                });

                await api.post('/payment-transactions', {
                    userID,
                    orderIDs: details.orderIds || [],
                    paymentMethod: 'card',
                    totalAmount: amount ? parseFloat(amount) / 100 : 0,
                    jazzCashResponse,
                });
                console.log('✅ Card payment transaction saved successfully');
            } catch (txnErr: any) {
                console.error('❌ Error saving payment transaction:', txnErr?.response?.data || txnErr.message);
            }

            setLoading(false);
        };

        processPayment();
    }, [searchParams]);

    const formatAmount = (amount: string | undefined) => {
        if (!amount) return 'N/A';
        // Amount is in paisa, convert to PKR
        const pkr = parseFloat(amount) / 100;
        return `PKR ${pkr.toLocaleString()}`;
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={8}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        textAlign: 'center',
                        p: 4,
                    }}
                >
                    {/* Status Icon */}
                    <Box sx={{ mb: 3 }}>
                        {paymentStatus === 'success' ? (
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                        ) : (
                            <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
                        )}
                    </Box>

                    {/* Status Message */}
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {paymentStatus === 'success'
                            ? 'Your transaction has been completed successfully.'
                            : paymentDetails.responseMessage || 'The transaction could not be completed.'}
                    </Typography>

                    {/* Payment Details */}
                    <Box
                        sx={{
                            bgcolor: '#f5f5f5',
                            borderRadius: 2,
                            p: 3,
                            mb: 3,
                            textAlign: 'left',
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Transaction Details
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Transaction ID:</Typography>
                            <Typography variant="body2" fontWeight="600">
                                {paymentDetails.txnRefNo || 'N/A'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Amount:</Typography>
                            <Typography variant="body2" fontWeight="600">
                                {formatAmount(paymentDetails.amount)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Response Code:</Typography>
                            <Typography variant="body2" fontWeight="600">
                                {paymentDetails.responseCode || 'N/A'}
                            </Typography>
                        </Box>

                        {paymentDetails.orderIds && paymentDetails.orderIds.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Order ID(s):</Typography>
                                <Typography variant="body2" fontWeight="600" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                                    {paymentDetails.orderIds.join(', ')}
                                </Typography>
                            </Box>
                        )}

                        {paymentStatus === 'success' && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Transaction completed successfully
                            </Alert>
                        )}

                        {paymentStatus === 'failed' && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {paymentDetails.responseMessage || 'Transaction failed'}
                            </Alert>
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {paymentStatus !== 'success' && (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/user/cart')}
                                sx={{
                                    borderColor: '#1a472a',
                                    color: '#1a472a',
                                    '&:hover': {
                                        borderColor: '#15372a',
                                        bgcolor: 'rgba(26, 71, 42, 0.04)',
                                    },
                                }}
                            >
                                Try Again
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => navigate('/home-baraka')}
                            sx={{
                                background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #15372a 0%, #244a35 100%)',
                                },
                            }}
                        >
                            Go to Home
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PaymentCallback;
