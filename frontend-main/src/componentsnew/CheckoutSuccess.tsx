import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaHome, FaShoppingBag } from 'react-icons/fa';

const CheckoutSuccess: React.FC = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ padding: '4rem 0', minHeight: '60vh' }}>
            <div className="container">
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        fontSize: '5rem',
                        color: '#4CAF50',
                        marginBottom: '2rem'
                    }}>
                        <FaCheckCircle />
                    </div>

                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#2c5530',
                        marginBottom: '1rem'
                    }}>
                        {t('checkoutSuccess.title')}
                    </h1>

                    <p style={{
                        fontSize: '1.2rem',
                        color: '#666',
                        marginBottom: '2rem',
                        lineHeight: '1.6'
                    }}>
                        {t('checkoutSuccess.subtitle')}
                    </p>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            color: '#2c5530',
                            marginBottom: '1rem'
                        }}>
                            {t('checkoutSuccess.whatsNextTitle')}
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            color: '#000000'
                        }}>
                            <li style={{
                                padding: '0.5rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#000000'
                            }}>
                                <span style={{ color: '#4CAF50' }}>✓</span>
                                {t('checkoutSuccess.stepEmailSent')}
                            </li>
                            <li style={{
                                padding: '0.5rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#000000'
                            }}>
                                <span style={{ color: '#4CAF50' }}>✓</span>
                                {t('checkoutSuccess.stepPaymentProcessed')}
                            </li>
                            <li style={{
                                padding: '0.5rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#000000'
                            }}>
                                <span style={{ color: '#FFA726' }}>⏳</span>
                                {t('checkoutSuccess.stepPreparing')}
                            </li>
                            <li style={{
                                padding: '0.5rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#000000'
                            }}>
                                <span style={{ color: '#FFA726' }}>⏳</span>
                                {t('checkoutSuccess.stepTracking')}
                            </li>
                        </ul>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link to="/home1" onClick={() => window.scrollTo(0, 0)} className="btn" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '12px 24px',
                            backgroundColor: '#1E4620',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            border: '2px solid #1E4620'
                        }}>
                            <FaHome />
                            {t('checkoutSuccess.backToHomeBtn')}
                        </Link>

                        <Link to="/shop-islamic" onClick={() => window.scrollTo(0, 0)} className="btn" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '12px 24px',
                            backgroundColor: 'white',
                            color: '#1E4620',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            border: '2px solid #1E4620'
                        }}>
                            <FaShoppingBag />
                            {t('checkoutSuccess.continueShoppingBtn')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
