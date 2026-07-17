import React from 'react';

const TermsConditions: React.FC = () => {
    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#f9fafb', minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: '700'
                        }}>
                            Terms and Conditions
                        </h1>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <section className="mb-5">
                        <h2 style={{
                            color: '#1a4122',
                            marginBottom: '1.5rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.8rem',
                            fontWeight: '600'
                        }}>
                            Welcome to Barakah
                        </h2>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            These terms and conditions outline the rules and regulations for the use of Barakah's Website and services. By accessing our website and making purchases, you agree to be bound by these Terms and Conditions and agree that you are responsible for compliance with any applicable local laws.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            1. Product Information
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                We strive to display accurate product information
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                Colors may vary slightly due to display settings
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                We reserve the right to modify product specifications
                            </li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            2. Pricing and Payment
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                All prices are in USD unless otherwise stated
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                Prices are subject to change without notice
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                We accept major credit cards and secure payment methods
                            </li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            3. Shipping and Delivery
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                Delivery times are estimates only
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                Shipping costs are calculated at checkout
                            </li>
                            <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                International orders may be subject to customs duties
                            </li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            4. Account Responsibilities
                        </h3>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            You are responsible for maintaining the confidentiality of your account and password. Please notify us immediately of any unauthorized use.
                        </p>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            5. Intellectual Property
                        </h3>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            All content on this website is the property of Barakah and is protected by copyright laws.
                        </p>
                    </section>

                    <section>
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            Contact Information
                        </h3>
                        <p style={{ color: '#000000', marginBottom: '1rem', lineHeight: '1.7' }}>
                            For any questions regarding these terms, please contact us:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#000000' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> info@barakah.com</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> +92 300 1234567</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
