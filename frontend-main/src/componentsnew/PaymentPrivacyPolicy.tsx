import React from 'react';

const PaymentPrivacyPolicy: React.FC = () => {
    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#f9fafb', minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    {/* Privacy Policy Section */}
                    <section className="mb-10" style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            color: '#1a4122',
                            marginBottom: '1.5rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '2.5rem',
                            fontWeight: '600',
                            borderBottom: '2px solid #1a4122',
                            paddingBottom: '0.5rem'
                        }}>
                            Privacy Policy
                        </h2>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                            At Barakah, your privacy is important to us. We are committed to protecting your personal information and ensuring a safe shopping experience.
                        </p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Information We Collect</h3>
                        <p style={{ color: '#000000', marginBottom: '0.5rem' }}>We may collect the following information:</p>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Name, phone number, and email address</li>
                            <li style={{ marginBottom: '0.5rem' }}>Shipping and billing address</li>
                            <li style={{ marginBottom: '0.5rem' }}>Payment-related information (only as required to process your order)</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>How We Use Your Information</h3>
                        <p style={{ color: '#000000', marginBottom: '0.5rem' }}>Your information is used to:</p>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Process and deliver your orders</li>
                            <li style={{ marginBottom: '0.5rem' }}>Communicate order updates and provide customer support</li>
                            <li style={{ marginBottom: '0.5rem' }}>Improve our website, products, and services</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Data Protection</h3>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>We take appropriate security measures to protect your personal data</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your information is not sold, traded, or shared with third parties, except when necessary to complete your order (e.g., delivery services)</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Cookies</h3>
                        <p style={{ color: '#000000', marginBottom: '1.5rem' }}>Our website may use cookies to enhance user experience and analyze website traffic</p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Third-Party Services</h3>
                        <p style={{ color: '#000000', marginBottom: '1.5rem' }}>We may use trusted third-party services such as payment gateways and courier partners to process orders securely</p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Your Consent</h3>
                        <p style={{ color: '#000000', marginBottom: '1.5rem' }}>By using our website, you agree to the collection and use of your information as outlined in this Privacy Policy</p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Contact Us</h3>
                        <p style={{ color: '#000000', marginBottom: '0.5rem' }}>If you have any questions about our Privacy Policy, please contact us:</p>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#000000' }}>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> info@barakah.com</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Phone:</strong> +92 300 1234567</li>
                        </ul>
                    </section>

                    {/* Payment Policy Section */}
                    <section>
                        <h2 style={{
                            color: '#1a4122',
                            marginBottom: '1.5rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '2.5rem',
                            fontWeight: '600',
                            borderBottom: '2px solid #1a4122',
                            paddingBottom: '0.5rem'
                        }}>
                            Payment Policy
                        </h2>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                            At Barakah, we provide secure and flexible payment options for your convenience.
                        </p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Accepted Payment Methods</h3>
                        <p style={{ color: '#000000', marginBottom: '0.5rem' }}>We currently accept:</p>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Cash on Delivery (COD) – Pay in cash at the time of delivery</li>
                            <li style={{ marginBottom: '0.5rem' }}>Bank Transfer (Bank Alfalah) – Direct transfer to our Bank Alfalah account</li>
                            <li style={{ marginBottom: '0.5rem' }}>Debit/Credit Cards – Secure online card payments</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Payment Terms</h3>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Full payment is required in advance for Bank Transfers and Card Payments</li>
                            <li style={{ marginBottom: '0.5rem' }}>Cash on Delivery orders may require confirmation before dispatch</li>
                            <li style={{ marginBottom: '0.5rem' }}>Orders are processed after payment verification (for bank transfers)</li>
                            <li style={{ marginBottom: '0.5rem' }}>We reserve the right to cancel any order due to payment issues or suspicious activity</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Order Confirmation</h3>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Customers may be asked to provide proof of payment for bank transfers</li>
                            <li style={{ marginBottom: '0.5rem' }}>Card payments are processed instantly upon successful authorization</li>
                        </ul>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Currency</h3>
                        <p style={{ color: '#000000', marginBottom: '1.5rem' }}>All transactions are processed in PKR (Pakistani Rupees) unless stated otherwise</p>

                        <h3 style={{ color: '#1a4122', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>Payment Security</h3>
                        <ul style={{ paddingLeft: '1.5rem', color: '#000000', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>We use secure systems and trusted payment gateways to protect your financial information</li>
                            <li style={{ marginBottom: '0.5rem' }}>Your payment details are kept confidential and are not stored or misused</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PaymentPrivacyPolicy;
