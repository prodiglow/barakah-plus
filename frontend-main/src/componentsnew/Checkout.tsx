import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaLock, FaCreditCard, FaMapMarkerAlt, FaUser, FaMobileAlt } from 'react-icons/fa';

interface CartItem {
    id: number | string;
    name: string;
    image: string;
    category: string;
    price: number;
    quantity: number;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    // Payment specific
    paymentMethod: string; // 'card' or 'mwallet'
    [key: string]: string; // Allow index signature for dynamic access
}

interface Errors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    [key: string]: string | undefined;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Checkout: React.FC = () => {
    const { items, getTotalPrice, clearCart } = useCart() as {
        items: CartItem[];
        getTotalPrice: () => number;
        clearCart: () => void;
    };

    const subtotal = getTotalPrice();
    const shippingCost = subtotal > 1999 ? 0 : 250;
    const total = subtotal + shippingCost;

    const navigate = useNavigate();
    // const formRef = useRef<HTMLFormElement>(null); // Removed as unused

    // activeTab: 'card', 'mwallet' or 'alfalah'
    const [activeTab, setActiveTab] = useState<'card' | 'mwallet' | 'alfalah'>('card');

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        paymentMethod: 'card'
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // For JazzCash Redirect
    // const [redirectData, setRedirectData] = useState<Record<string, string> | null>(null); // Removed
    // const [redirectUrl, setRedirectUrl] = useState<string | null>(null); // Removed

    // JazzCash Mobile Number (for Wallet)
    const [jazzCashMobile, setJazzCashMobile] = useState('');
    // Card Specific Fields (Optional)
    const [cardMobile, setCardMobile] = useState('');
    const [cardEmail, setCardEmail] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Handle specific formatting if needed
        let formattedValue = value;

        if (name === 'phone') {
            // Optional: formatting for phone if needed
            formattedValue = value.replace(/\D/g, '').slice(0, 11);
        }

        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTabChange = (tab: 'card' | 'mwallet' | 'alfalah') => {
        setActiveTab(tab);
        setFormData(prev => ({
            ...prev,
            paymentMethod: tab
        }));
        setErrors({}); // Clear errors on tab switch
    };

    const validateForm = () => {
        const newErrors: Errors = {};

        // Required fields validation
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (Pakistani number: 11 digits)
        if (formData.phone && !/^\d{11}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = 'Please enter a valid 11-digit phone number (e.g., 03001234567)';
        }

        // Payment method validation
        if (activeTab === 'mwallet') {
            if (!jazzCashMobile) {
                newErrors.jazzCashMobile = 'JazzCash Mobile Number is required';
            } else if (!/^03\d{9}$/.test(jazzCashMobile)) {
                newErrors.jazzCashMobile = 'Please enter a valid JazzCash Mobile Number (03XXXXXXXXX)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            const endpoint = activeTab === 'card'
                ? `${API_BASE_URL}/api/payment/card`
                : activeTab === 'alfalah'
                    ? `${API_BASE_URL}/api/alfalah/initiate`
                    : `${API_BASE_URL}/api/payment/mwallet`;

            const payload: any = {
                amount: total,
                customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                customerEmail: formData.email.trim(),
                description: `Order Payment - ${formData.email}`,
                billReference: `ORDER${Date.now()}`,
                returnUrl: `https://barakah-project-be.vercel.app/api/payment/callback`,
            };

            if (activeTab === 'alfalah') {
                payload.transactionTypeId = '3'; // Credit/Debit Card via APG
            }

            // Override with optional card fields if provided
            if (activeTab === 'card') {
                if (cardMobile) payload.customerPhone = cardMobile;
                if (cardEmail) payload.customerEmail = cardEmail;
            }

            if (activeTab === 'mwallet') {
                // For redirect mode, we don't send mobile/CNIC to backend
                // effectively sending empty strings if backend expects them
                payload.customerPhone = jazzCashMobile;
                payload.customerCnic = "123456"; // Dummy CNIC as required by some integrations or reuse existing if available
            }

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
                throw new Error('System Error: Invalid response from server');
            }

            if (!response.ok || !data.success) {
                const errorMsg = data.error || (data.data && data.data.pp_ResponseMessage) || 'Payment initiation failed';
                throw new Error(errorMsg);
            }

            if (activeTab === 'mwallet') {
                // Handle MWallet Direct API Response
                const jazzResponse = data.data;
                if (jazzResponse && jazzResponse.pp_ResponseCode === '000') {
                    // Success - Navigate to callback page with response data
                    clearCart();
                    const params = new URLSearchParams();
                    Object.entries(jazzResponse).forEach(([key, value]) => {
                        if (value) params.append(key, String(value));
                    });
                    navigate(`/payment/callback1?${params.toString()}`);
                } else {
                    // Failure
                    throw new Error(jazzResponse?.pp_ResponseMessage || 'Payment Failed. Please try again.');
                }
            } else {
                // Handle Card / Alfalah Payment - Hosted Payment Page Redirect
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

                // Fallback / Error
                throw new Error(data.error || 'Invalid response for card payment');
            }

        } catch (error: any) {
            console.error('Payment processing error:', error);
            alert(error.message || 'Payment processing failed. Please try again.');
            setIsProcessing(false);
        }
        // Note: setIsProcessing(false) is handled in catch or if needed. 
        // If redirecting, we generally leave it 'processing' until the page unloads.
    };

    if (items.length === 0) {
        return (
            <div style={{ padding: '4rem 0', minHeight: '60vh' }}>
                <div className="container">
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            color: '#666',
                            marginBottom: '1rem'
                        }}>
                            No items to checkout
                        </h2>
                        <p style={{
                            color: '#999',
                            marginBottom: '2rem'
                        }}>
                            Add some items to your cart first
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="container">
                {/* Page Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#2c5530',
                        marginBottom: '1rem'
                    }}>
                        Checkout
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '1.1rem'
                    }}>
                        Complete your order securely
                    </p>
                </div>

                <div className="checkout-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 400px',
                    gap: '2rem',
                    alignItems: 'start',
                    width: '75%',
                    margin: '0 auto'
                }}>
                    {/* Checkout Form */}
                    <div>
                        <form onSubmit={handleSubmit}>
                            {/* Personal Information */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    marginBottom: '1.5rem',
                                    color: '#2c5530',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FaUser />
                                    Personal Information
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.firstName ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                transition: 'border-color 0.3s ease'
                                            }}
                                        />
                                        {errors.firstName && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.lastName ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.lastName && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.lastName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.email ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.email && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.phone ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.phone && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    marginBottom: '1.5rem',
                                    color: '#2c5530',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FaMapMarkerAlt />
                                    Shipping Address
                                </h3>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '500',
                                        color: '#333'
                                    }}>
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            border: `2px solid ${errors.address ? '#f44336' : '#e0e0e0'}`,
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                    {errors.address && (
                                        <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.city ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.city && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.state ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.state && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.5rem',
                                            fontWeight: '500',
                                            color: '#333'
                                        }}>
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                border: `2px solid ${errors.zipCode ? '#f44336' : '#e0e0e0'}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                        {errors.zipCode && (
                                            <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                {errors.zipCode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                padding: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    marginBottom: '1.5rem',
                                    color: '#2c5530',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FaCreditCard />
                                    Payment Information
                                </h3>

                                {/* Tabs for Card / MWallet */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginBottom: '2rem',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('card')}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '1rem',
                                            fontWeight: activeTab === 'card' ? '600' : '400',
                                            color: activeTab === 'card' ? '#2c5530' : '#666',
                                            borderBottom: activeTab === 'card' ? '2px solid #2c5530' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaCreditCard /> Card
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('mwallet')}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '1rem',
                                            fontWeight: activeTab === 'mwallet' ? '600' : '400',
                                            color: activeTab === 'mwallet' ? '#2c5530' : '#666',
                                            borderBottom: activeTab === 'mwallet' ? '2px solid #2c5530' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaMobileAlt /> MWallet (JazzCash)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('alfalah')}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            border: 'none',
                                            background: 'none',
                                            fontSize: '1rem',
                                            fontWeight: activeTab === 'alfalah' ? '600' : '400',
                                            color: activeTab === 'alfalah' ? '#2c5530' : '#666',
                                            borderBottom: activeTab === 'alfalah' ? '2px solid #2c5530' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaCreditCard /> Bank Alfalah
                                    </button>
                                </div>

                                {activeTab === 'alfalah' ? (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        color: '#666'
                                    }}>
                                        <strong>How to pay:</strong>
                                        <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                            <li>Click "Complete Order" to be redirected to the Bank Alfalah secure payment page</li>
                                            <li>Pay securely with your credit or debit card</li>
                                            <li>You will be brought back here once the payment completes</li>
                                        </ol>
                                    </div>
                                ) : activeTab === 'card' ? (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        color: '#666'
                                    }}>
                                        <strong>How to pay:</strong>
                                        <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                            <li>Click "Pay with Card" to be redirected to the JazzCash secure payment page</li>
                                            <li>Enter your Card Details Securely</li>
                                            <li>Follow the instructions to complete the payment</li>
                                        </ol>

                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}>
                                                Mobile Number (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={cardMobile}
                                                onChange={(e) => setCardMobile(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                                placeholder="03XXXXXXXXX"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    marginBottom: '1rem'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}>
                                                Email (Optional)
                                            </label>
                                            <input
                                                type="email"
                                                value={cardEmail}
                                                onChange={(e) => setCardEmail(e.target.value)}
                                                placeholder="user@example.com"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        color: '#666'
                                    }}>
                                        <strong>How to pay:</strong>
                                        <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                            <li>Click "Pay" to be redirected to the JazzCash secure payment page</li>
                                            <li>Enter your JazzCash Mobile Number</li>
                                            <li>Follow the instructions to complete the payment</li>
                                        </ol>

                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: '500',
                                                color: '#333'
                                            }}>
                                                JazzCash Mobile Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={jazzCashMobile}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                    setJazzCashMobile(val);
                                                    if (errors.jazzCashMobile) {
                                                        setErrors(prev => ({ ...prev, jazzCashMobile: undefined }));
                                                    }
                                                }}
                                                placeholder="03XXXXXXXXX"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    border: `2px solid ${errors.jazzCashMobile ? '#f44336' : '#e0e0e0'}`,
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                            {errors.jazzCashMobile && (
                                                <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                                                    {errors.jazzCashMobile}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Security Notice */}
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: '#666'
                                }}>
                                    <FaLock />
                                    <span>Your payment information is secure and encrypted</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    backgroundColor: isProcessing ? '#ccc' : '#2c5530',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.2rem',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isProcessing ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #fff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaLock />
                                        Complete Order - PKR {total.toLocaleString()}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        padding: '2rem',
                        position: 'sticky',
                        top: '2rem'
                    }}>
                        <h3 className="premium-font" style={{ fontSize: '1.8rem', marginBottom: '25px', color: '#000000', letterSpacing: '-0.5px' }}>Order Summary</h3>

                        {/* Order Items */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            {items.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.8rem 0',
                                    borderBottom: '1px solid #f0f0f0'
                                }}>
                                    <div>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            margin: 0,
                                            color: '#333'
                                        }}>
                                            {item.name}
                                        </p>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            margin: 0,
                                            color: '#666'
                                        }}>
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#2c5530'
                                    }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px dashed #e0e0e0' }}>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#555' }}>Subtotal</span>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#000000' }}>PKR {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#555' }}>Shipping</span>
                                {shippingCost === 0 ? (
                                    <span style={{ color: '#108960', fontWeight: 'bold', background: 'rgba(16, 137, 96, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>Complimentary</span>
                                ) : (
                                    <span style={{ fontWeight: 600, color: '#000000' }}>PKR {shippingCost}</span>
                                )}
                            </div>
                        </div>

                        <div className="summary-total" style={{ borderTop: 'none', marginTop: '20px', paddingTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#000000' }}>Total</span>
                            <span style={{ fontSize: '2rem', color: '#108960', fontWeight: 700 }}>PKR {total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Checkout;
