import React, { useEffect, useState, useRef } from 'react';
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
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useCart } from '../context/CartContext';
import { moveCartToOrder } from '../services/cartService';
import { MoveCartToOrderRequest } from '../types/cart';
import { cartEvents } from '../Components/cart/cartEvents';
import api from '../services/api';

/**
 * Result page for Bank Alfalah APG payments.
 * The backend return handler verifies the transaction against the APG IPN
 * status API before redirecting here, so `status` is already trustworthy
 * when `verified=true`.
 */
const AlfalahCallback: React.FC = () => {
    const { clearCart } = useCart() as { clearCart: () => void };
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'unknown'>('unknown');
    const [details, setDetails] = useState<{
        orderRef?: string;
        amount?: string;
        transactionId?: string;
        message?: string;
        verified?: boolean;
        orderIds?: string[];
    }>({});
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const processResult = async () => {
            const status = searchParams.get('status');
            const verified = searchParams.get('verified') === 'true';
            const orderRef = searchParams.get('orderRef') || '';
            const amount = searchParams.get('amount') || '';
            const transactionId = searchParams.get('transactionId') || '';
            const message = searchParams.get('message') || '';

            const info: any = { orderRef, amount, transactionId, message, verified };

            if (status === 'paid') {
                setPaymentStatus('success');
                clearCart();

                // Cart-service flow parity with JazzCash (PaymentCallback1)
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
                            info.orderIds = response.data
                                ? response.data.map((o: any) => o._id || o.orderID)
                                : [];
                        }
                    } catch (err) {
                        console.error('Error creating orders from cart:', err);
                    }
                }
            } else if (status === 'failed') {
                setPaymentStatus('failed');
                localStorage.removeItem('pendingCartOrder');
            } else if (status === 'pending') {
                // In-flight / not yet verifiable — do NOT clear the pending cart
                // order or declare a failure; the IPN listener will settle it.
                setPaymentStatus('pending');
            } else {
                setPaymentStatus('unknown');
            }

            setDetails(info);

            // Persist the transaction. Map to the backend's response-code convention:
            //   paid → '000' (Success), failed with a code → that code (Failed),
            //   pending/unknown → '' so the backend derives "Pending" (parity with JazzCash).
            const responseCode =
                status === 'paid' ? '000' : status === 'failed' ? (searchParams.get('rc') || '99') : '';
            const userID = localStorage.getItem('userId') || '';
            if (userID) {
                try {
                    await api.post('/payment-transactions', {
                        userID,
                        orderIDs: info.orderIds || [],
                        paymentMethod: 'alfalah',
                        totalAmount: amount ? parseFloat(amount) : 0,
                        jazzCashResponse: {
                            pp_ResponseCode: responseCode,
                            pp_ResponseMessage: message || status || '',
                            pp_TxnRefNo: orderRef,
                            pp_Amount: amount,
                            pp_TxnCurrency: 'PKR',
                            pp_AuthCode: transactionId,
                        },
                    });
                    console.log('✅ Alfalah payment transaction saved');
                } catch (txnErr: any) {
                    console.error('❌ Error saving payment transaction:', txnErr?.response?.data || txnErr.message);
                }
            }

            setLoading(false);
        };

        processResult();
    }, [searchParams]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #be1e2d 0%, #a01825 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', textAlign: 'center', p: 4 }}>
                    {loading ? (
                        <Box sx={{ py: 6 }}>
                            <CircularProgress sx={{ color: '#be1e2d' }} />
                            <Typography sx={{ mt: 2 }}>Confirming your payment…</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 3 }}>
                                {paymentStatus === 'success' ? (
                                    <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                                ) : paymentStatus === 'pending' ? (
                                    <HourglassTopIcon sx={{ fontSize: 80, color: '#ed6c02' }} />
                                ) : (
                                    <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
                                )}
                            </Box>

                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {paymentStatus === 'success'
                                    ? 'Payment Successful!'
                                    : paymentStatus === 'pending'
                                        ? 'Payment Processing'
                                        : paymentStatus === 'failed'
                                            ? 'Payment Failed'
                                            : 'Payment Status Unknown'}
                            </Typography>

                            {paymentStatus === 'pending' && (
                                <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                                    Your payment is being processed by the bank. We'll confirm your order
                                    as soon as it settles — no need to pay again. Keep your order reference
                                    for your records.
                                </Alert>
                            )}

                            {paymentStatus !== 'pending' && details.verified === false && (
                                <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                                    We could not confirm this result with the bank yet. If you were charged,
                                    your order will still be recorded — please contact support with your
                                    order reference.
                                </Alert>
                            )}

                            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 3, mb: 3, textAlign: 'left' }}>
                                {details.orderRef && (
                                    <Typography variant="body2"><strong>Order Reference:</strong> {details.orderRef}</Typography>
                                )}
                                {details.transactionId && (
                                    <Typography variant="body2"><strong>Transaction ID:</strong> {details.transactionId}</Typography>
                                )}
                                {details.amount && (
                                    <Typography variant="body2"><strong>Amount:</strong> PKR {details.amount}</Typography>
                                )}
                                {details.message && (
                                    <Typography variant="body2"><strong>Status:</strong> {details.message}</Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                {paymentStatus === 'success' ? (
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/')}
                                        sx={{ background: '#2c5530', '&:hover': { background: '#1e3b21' } }}
                                    >
                                        Continue Shopping
                                    </Button>
                                ) : paymentStatus === 'failed' || paymentStatus === 'unknown' ? (
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/checkout1')}
                                        sx={{ background: '#be1e2d', '&:hover': { background: '#a01825' } }}
                                    >
                                        Try Again
                                    </Button>
                                ) : null}
                                <Button variant="outlined" onClick={() => navigate('/')}>
                                    Go to Home
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default AlfalahCallback;
