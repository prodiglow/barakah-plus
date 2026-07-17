import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "What types of payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment gateway."
        },
        {
            question: "How long does shipping take?",
            answer: "Domestic shipping typically takes 3-5 business days. International shipping can take 7-14 business days depending on the destination. Express shipping options are available at checkout."
        },
        {
            question: "Are your products authentic and halal-certified?",
            answer: "Yes, all our products are sourced from authentic suppliers and are halal-certified where applicable. We work directly with trusted manufacturers and suppliers from sacred Islamic sites."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Please note that international orders may be subject to customs duties and taxes."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns within 30 days of purchase for most items in their original condition. Some items like prayer caps and books cannot be returned for hygiene reasons. Please see our Returns Policy for full details."
        },
        {
            question: "How do I track my order?",
            answer: "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package through our website or the carrier's website."
        },
        {
            question: "Are the prayer mats machine washable?",
            answer: "Most of our prayer mats are machine washable on a gentle cycle. Please check the product description or care label for specific washing instructions."
        },
        {
            question: "Do you offer wholesale or bulk pricing?",
            answer: "Yes, we offer special pricing for bulk orders and wholesale customers. Please contact our sales team at info@barakaplus.com for more information."
        },
        {
            question: "How do I know which prayer cap size to order?",
            answer: "We provide detailed size guides for our prayer caps. You can measure your head circumference and refer to the size chart on each product page. If you're between sizes, we recommend ordering the larger size."
        },
        {
            question: "Where do you source your products from?",
            answer: "Our products are sourced from various sacred Islamic sites including Makkah, Madinah, Kufa, and Karbala. We work with local artisans and certified suppliers to ensure authenticity and quality."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={{ padding: '4rem 0' }}>
            <div className="container">
                <h1 style={{
                    fontSize: '2.5rem',
                    color: '#2c5530',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    Frequently Asked Questions
                </h1>

                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: '#2c5530',
                                    fontWeight: '600',
                                    fontSize: '1.1rem'
                                }}
                            >
                                {faq.question}
                                {openIndex === index ? (
                                    <FaMinus style={{ flexShrink: 0, marginLeft: '1rem' }} />
                                ) : (
                                    <FaPlus style={{ flexShrink: 0, marginLeft: '1rem' }} />
                                )}
                            </button>
                            <div
                                style={{
                                    padding: openIndex === index ? '0 1.5rem 1.5rem' : '0 1.5rem',
                                    maxHeight: openIndex === index ? '1000px' : '0',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    opacity: openIndex === index ? 1 : 0
                                }}
                            >
                                <p style={{
                                    margin: 0,
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                {/* <div style={{
                    textAlign: 'center',
                    marginTop: '4rem',
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#2c5530',
                        marginBottom: '1rem',
                        fontSize: '1.5rem'
                    }}>
                        Still have questions?
                    </h2>
                    <p style={{
                        color: '#666',
                        marginBottom: '1.5rem'
                    }}>
                        Our customer service team is here to help you
                    </p>
                    <a
                        href="mailto:support@barakah.com"
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Contact Support
                    </a>
                </div> */}
            </div>
        </div>
    );
};

export default FAQ;
