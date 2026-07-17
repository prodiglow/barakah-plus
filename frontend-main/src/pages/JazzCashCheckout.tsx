import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    Paper,
    CircularProgress,
    Alert,
    InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

const JazzCashCheckout: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
                borderColor: '#1a472a',
            },
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#1a472a',
        },
    };

    // Common fields
    const [amount, setAmount] = useState<string>('1000');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');

    // Card specific fields
    // Card specific fields - No longer needed for Hosted Payment Page
    // const [cardNumber, setCardNumber] = useState<string>('');
    // const [cardCvv, setCardCvv] = useState<string>('');
    // const [cardExpiry, setCardExpiry] = useState<string>('');


    // Wallet specific fields - Pre-filled with testing data
    // const [customerCnic, setCustomerCnic] = useState('123456');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(null);
    };

    const handlePayment = async (paymentType: 'card' | 'mwallet') => {
        setLoading(true);
        setError(null);

        // Validate common fields
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            setLoading(false);
            return;
        }
        // if (!customerName.trim()) {
        //     setError('Customer name is required');
        //     setLoading(false);
        //     return;
        // }
        // if (!customerEmail.trim()) {
        //     setError('Customer email is required');
        //     setLoading(false);
        //     return;
        // }

        try {
            const endpoint = paymentType === 'card'
                ? `${API_BASE_URL}/api/payment/card`
                : `${API_BASE_URL}/api/payment/mwallet`;

            const payload: any = {
                amount: parseFloat(amount),
                customerName: 'Guest Customer',
                customerEmail: customerEmail || 'guest@example.com',
                customerPhone: customerPhone,
                description: 'Payment',
                billReference: `ORDER${Date.now()}`,
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse backend response JSON:', e);
                setError('System Error: Invalid response from server');
                setLoading(false);
                return;
            }

            if (!response.ok || !data.success) {
                console.error('Payment failed response:', data);
                // Try to find error message in pp_ResponseMessage if present in data.data or data root
                const errorMsg = data.error || (data.data && data.data.pp_ResponseMessage) || 'Payment initiation failed';
                throw new Error(errorMsg);
            }

            if (paymentType === 'mwallet') {
                // Handle MWallet Direct API Response
                const jazzResponse = data.data;
                if (jazzResponse && jazzResponse.pp_ResponseCode === '000') {
                    // Success - Navigate to callback page with response data
                    // Create query string from response object
                    const params = new URLSearchParams();
                    Object.entries(jazzResponse).forEach(([key, value]) => {
                        if (value) params.append(key, String(value));
                    });
                    navigate(`/payment/callback1?${params.toString()}`);
                } else {
                    // Failure
                    setError(jazzResponse?.pp_ResponseMessage || 'Payment Failed. Please try again.');
                    setLoading(false);
                }
            } else {
                // Handle Card Payment - Hosted Payment Page Redirect
                if (data.postUrl && data.formFields) {
                    // Create a hidden form and submit it
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = data.postUrl;

                    Object.entries(data.formFields).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = String(value);
                        form.appendChild(input);
                    });

                    document.body.appendChild(form);
                    form.submit();
                    return;
                }

                // Fallback for old/error response
                const jazzResponse = data.data;
                const resMsg = jazzResponse?.responseMessage || jazzResponse?.pp_ResponseMessage || data.error || 'Payment Failed';
                setError(resMsg);
                setLoading(false);
            }

        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 50%, #1a472a 100%)',
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={8}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.98)',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                            color: 'white',
                            py: 4,
                            px: 3,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            JazzCash Checkout
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Test your payment integration
                        </Typography>
                    </Box>

                    {/* Amount Input */}
                    <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                        <TextField
                            fullWidth
                            label="Amount (PKR)"
                            type="number"
                            disabled
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1a472a',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#1a472a',
                                },
                            }}
                        />
                    </Box>

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
                            '& .MuiTab-root': {
                                py: 2,
                                fontWeight: 600,
                            },
                            '& .Mui-selected': {
                                color: '#1a472a !important',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#1a472a',
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
                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* How to pay instructions */}
                            <Box
                                sx={{
                                    bgcolor: '#f8f9fa',
                                    borderRadius: 2,
                                    p: 2,
                                    mt: 1,
                                }}
                            >
                                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                                    How to pay:
                                </Typography>
                                <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5, color: 'text.secondary', fontSize: '0.875rem' } }}>
                                    <li>Click "Pay" to be redirected to the JazzCash secure payment page</li>
                                    <li>Enter your Card Details on the JazzCash page</li>
                                    <li>Complete the transaction securely</li>
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Mobile Number (Optional)"
                                placeholder="03XXXXXXXXX"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                sx={{ ...inputStyles }}
                            />

                            <TextField
                                fullWidth
                                label="Email (Optional)"
                                placeholder="user@example.com"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                sx={{ ...inputStyles }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => handlePayment('card')}
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #15372a 0%, #244a35 100%)',
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    `Pay PKR ${amount || '0'} with Card`
                                )}
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* Wallet Payment Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                            {/* How to pay instructions */}
                            <Box
                                sx={{
                                    bgcolor: '#f8f9fa',
                                    borderRadius: 2,
                                    p: 2,
                                    mt: 1,
                                }}
                            >
                                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                                    How to pay:
                                </Typography>
                                <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5, color: 'text.secondary', fontSize: '0.875rem' } }}>
                                    <li>Click "Pay" to be redirected to the JazzCash secure payment page</li>
                                    <li>Enter your JazzCash Mobile Number</li>
                                    <li>Follow the instructions to complete the payment</li>
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
                                onClick={() => handlePayment('mwallet')}
                                disabled={loading}
                                sx={{
                                    mt: 1,
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #15372a 0%, #244a35 100%)',
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    `Pay PKR ${Number(amount || 0).toLocaleString()}`
                                )}
                            </Button>
                        </Box>
                    </TabPanel>

                    {/* Info Section */}
                    <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            🔒 Secure payment powered by JazzCash
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            {/* Hidden form for JazzCash redirect */}
            {/* Hidden form for JazzCash redirect - Removed as we switched to direct API */
                /*
                         {redirectData && redirectUrl && (
                             <form ref={formRef} method="POST" action={redirectUrl} style={{ display: 'none' }}>
                                 {Object.entries(redirectData).map(([key, value]) => (
                                     <input key={key} type="hidden" name={key} value={value} />
                                 ))}
                             </form>
                         )}
                 */
            }
        </Box>
    );
};

export default JazzCashCheckout;
