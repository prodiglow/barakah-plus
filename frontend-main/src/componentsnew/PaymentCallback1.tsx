import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
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

const PaymentCallback1: React.FC = () => {
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
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double processing in React StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

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
            if (error) {
                setPaymentStatus('failed');
                localStorage.removeItem('pendingCartOrder');
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

            // Save payment transaction to database (for BOTH success and failed)
            const userID = localStorage.getItem('userId') || '';
            if (userID) {
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
            <div style={{ padding: '4rem 0', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="success" />
            </div>
        );
    }

    return (
        <div style={{ padding: '4rem 0', minHeight: '60vh', backgroundColor: '#f9f9f9' }}>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        textAlign: 'center',
                        p: 4,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        backgroundColor: '#fff'
                    }}
                >
                    {/* Status Icon */}
                    <Box sx={{ mb: 3 }}>
                        {paymentStatus === 'success' ? (
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#2c5530' }} />
                        ) : (
                            <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
                        )}
                    </Box>

                    {/* Status Message */}
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#333' }}>
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
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            p: 3,
                            mb: 3,
                            textAlign: 'left',
                            border: '1px solid #eee'
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
                                onClick={() => navigate('/checkout1')}
                                sx={{
                                    borderColor: '#2c5530',
                                    color: '#2c5530',
                                    '&:hover': {
                                        borderColor: '#15372a',
                                        bgcolor: 'rgba(26, 71, 42, 0.04)',
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Try Again
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => navigate('/')}
                            sx={{
                                backgroundColor: '#2c5530',
                                '&:hover': {
                                    backgroundColor: '#15372a',
                                },
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            Go to Home
                        </Button>
                    </Box>
                </Paper>
            </div>
        </div>
    );
};

export default PaymentCallback1;
