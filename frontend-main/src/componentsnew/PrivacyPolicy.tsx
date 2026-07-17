import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div style={{ padding: '4rem 0' }}>
            <div className="container">
                <h1 style={{
                    fontSize: '2.5rem',
                    color: '#2c5530',
                    marginBottom: '2rem'
                }}>
                    Privacy Policy
                </h1>

                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <section className="mb-4">
                        <h2 style={{ color: '#2c5530', marginBottom: '1rem' }}>Your Privacy Matters</h2>
                        <p>At Barakah, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information when you use our website and services.</p>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Information We Collect</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Personal Information:</strong> Name, email address, shipping address, phone number
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Payment Information:</strong> Credit card details (processed securely through our payment processor)
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Usage Data:</strong> Browsing history, product preferences, device information
                            </li>
                        </ul>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>How We Use Your Information</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>•</span>
                                Process and fulfill your orders
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>•</span>
                                Send order confirmations and updates
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>•</span>
                                Provide customer support
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>•</span>
                                Improve our products and services
                            </li>
                        </ul>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Data Security</h3>
                        <p>We implement various security measures to protect your personal information:</p>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>🔒</span>
                                SSL encryption for all data transmission
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>🔒</span>
                                Secure payment processing
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>🔒</span>
                                Regular security audits
                            </li>
                        </ul>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Cookies and Tracking</h3>
                        <p>We use cookies to enhance your browsing experience and analyze website traffic. You can control cookie settings through your browser preferences.</p>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Third-Party Services</h3>
                        <p>We may share your information with trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>
                    </section>

                    <section className="mb-4">
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Your Rights</h3>
                        <p>You have the right to:</p>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>✓</span>
                                Access your personal data
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>✓</span>
                                Correct inaccurate data
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>✓</span>
                                Request deletion of your data
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#2c5530' }}>✓</span>
                                Opt-out of marketing communications
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3 style={{ color: '#2c5530', marginBottom: '1rem' }}>Contact Us</h3>
                        <p>If you have any questions about our privacy policy, please contact us:</p>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li>Email: info@barakah.com</li>
                            <li>Phone: +92 300 1234567</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
