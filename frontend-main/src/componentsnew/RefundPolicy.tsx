import React from 'react';

const RefundPolicy: React.FC = () => {
    return (
        <div style={{ padding: '4rem 0', backgroundColor: '#f9fafb', minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <section className="mb-5">
                        <h2 style={{
                            color: '#1a4122',
                            marginBottom: '1.5rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '2rem',
                            fontWeight: '600'
                        }}>
                            Return & Refund Policy
                        </h2>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            At Barakah, we want to ensure your complete satisfaction with your purchase. We understand that sometimes a product may not meet your expectations, and we're here to help.
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
                            Eligibility for Returns
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                "Items must be unused and in original packaging",
                                "Return request must be made within 30 days of purchase",
                                "Original receipt or proof of purchase required"
                            ].map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                    <span style={{ color: '#1a4122', fontSize: '1.2rem', lineHeight: '1' }}>✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
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
                            Non-Returnable Items
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                "Religious books and texts",
                                "Personal items like prayer caps once worn",
                                "Sale or clearance items"
                            ].map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: '#000000', fontSize: '1rem' }}>
                                    <span style={{ color: '#d32f2f', fontSize: '1.2rem', lineHeight: '1' }}>✕</span>
                                    <span>{item}</span>
                                </li>
                            ))}
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
                            Refund Process
                        </h3>
                        <ol style={{ paddingLeft: '1.5rem', color: '#000000' }}>
                            <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>
                                <strong>Initiate Return:</strong> Contact our customer service team within 30 days of purchase
                            </li>
                            <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>
                                <strong>Return Shipping:</strong> Pack items securely in original packaging
                            </li>
                            <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>
                                <strong>Processing:</strong> Returns are processed within 5-7 business days of receipt
                            </li>
                            <li style={{ marginBottom: '0.8rem', lineHeight: '1.6' }}>
                                <strong>Refund:</strong> Money will be refunded to original payment method
                            </li>
                        </ol>
                    </section>

                    <section className="mb-5">
                        <h3 style={{
                            color: '#1a4122',
                            marginBottom: '1rem',
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.5rem',
                            fontWeight: '600'
                        }}>
                            Shipping Costs
                        </h3>
                        <p style={{ color: '#000000', lineHeight: '1.7', fontSize: '1.05rem' }}>
                            Return shipping costs are the responsibility of the customer unless the return is due to our error (wrong item shipped, defective product, etc.).
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
                            Contact Us
                        </h3>
                        <p style={{ color: '#000000', marginBottom: '1rem', lineHeight: '1.7' }}>
                            If you have any questions about our return policy, please contact us:
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

export default RefundPolicy;
