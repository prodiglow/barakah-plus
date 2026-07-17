import React from 'react';
import { FaMosque, FaShippingFast, FaHandHoldingHeart, FaCertificate } from 'react-icons/fa';

const AboutUs: React.FC = () => {
    return (
        <div style={{ padding: '4rem 0' }}>
            <div className="container" style={{ maxWidth: '75%', margin: '0 auto' }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        color: '#2c5530',
                        marginBottom: '1.5rem'
                    }}>
                        About Barakah
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#666',
                        maxWidth: '800px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Your trusted source for authentic Islamic products and prayer services,
                        sourced directly from the world's most sacred Islamic sites.
                    </p>
                </div>

                {/* Our Story */}
                <section style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '12px',
                    marginBottom: '4rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#2c5530',
                        marginBottom: '1.5rem',
                        fontSize: '2rem'
                    }}>
                        Our Story
                    </h2>
                    <p style={{
                        color: '#666',
                        lineHeight: '1.8',
                        marginBottom: '1.5rem'
                    }}>
                        Barakah was founded with a vision to connect Muslims worldwide with authentic Islamic products
                        and prayer services. Our journey began with a simple mission: to provide access to blessed items
                        from the world's most sacred Islamic sites while maintaining the highest standards of quality and authenticity.
                    </p>
                    <p style={{
                        color: '#666',
                        lineHeight: '1.8'
                    }}>
                        Today, we are proud to serve our global Muslim community by offering carefully curated products
                        and dedicated prayer services that enhance your spiritual journey.
                    </p>
                </section>

                {/* Sacred Sources */}
                <section style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '12px',
                    marginBottom: '4rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#2c5530',
                        marginBottom: '2rem',
                        fontSize: '2rem',
                        fontFamily: '"Playfair Display", serif'
                    }}>
                        Our Sacred Sources
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem'
                    }}>
                        <div style={{ padding: '0.5rem' }}>
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.5rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Medina
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Home to the Prophet's Mosque, we source special prayer beads and religious texts
                                from local artisans who have maintained traditional crafting methods for generations.
                            </p>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.5rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Kufa
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                From this historic city, we obtain unique prayer mats and traditional Islamic artifacts,
                                each piece carrying the rich heritage of Islamic civilization.
                            </p>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.5rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Karbala
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Our collection includes specially crafted items from Karbala's skilled artisans,
                                known for their exceptional craftsmanship and spiritual significance.
                            </p>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.5rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Other Sacred Sites
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                We also source products from various other historically significant Islamic locations,
                                ensuring a diverse and authentic collection.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Services */}
                <section style={{
                    backgroundColor: 'white',
                    padding: '3rem',
                    borderRadius: '12px',
                    marginBottom: '4rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{
                        color: '#2c5530',
                        marginBottom: '2rem',
                        fontSize: '2rem',
                        textAlign: 'center',
                        fontFamily: '"Playfair Display", serif'
                    }}>
                        Our Services
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2rem'
                    }}>
                        <div style={{
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <FaMosque style={{
                                fontSize: '2.5rem',
                                color: '#2c5530',
                                marginBottom: '1rem'
                            }} />
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Prayer Services
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                We offer dedicated prayer services at sacred sites, allowing you to request prayers
                                for specific intentions or loved ones.
                            </p>
                        </div>
                        <div style={{
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <FaHandHoldingHeart style={{
                                fontSize: '2.5rem',
                                color: '#2c5530',
                                marginBottom: '1rem'
                            }} />
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Charitable Initiatives
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                A portion of every purchase goes towards supporting Islamic charitable causes
                                and community development projects.
                            </p>
                        </div>
                        <div style={{
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <FaCertificate style={{
                                fontSize: '2.5rem',
                                color: '#2c5530',
                                marginBottom: '1rem'
                            }} />
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Authentication Services
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                We provide certificates of authenticity for our products, verifying their
                                sacred origins and quality.
                            </p>
                        </div>
                        <div style={{
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <FaShippingFast style={{
                                fontSize: '2.5rem',
                                color: '#2c5530',
                                marginBottom: '1rem'
                            }} />
                            <h3 style={{
                                color: '#2c5530',
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                Global Shipping
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                We ensure careful handling and shipping of sacred items to Muslims worldwide,
                                maintaining their sanctity throughout the journey.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section style={{
                    textAlign: 'center',
                    backgroundColor: '#2c5530',
                    padding: '4rem',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <h2 style={{
                        marginBottom: '1.5rem',
                        fontSize: '2rem'
                    }}>
                        Connect With Us
                    </h2>
                    <p style={{
                        marginBottom: '2rem',
                        fontSize: '1.1rem',
                        opacity: 0.9
                    }}>
                        Have questions about our products or services? We're here to help.
                    </p>
                    <a
                        href="mailto:contact@barakah.com"
                        className="btn"
                        style={{
                            backgroundColor: 'white',
                            color: '#2c5530',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: '600'
                        }}
                    >
                        Get in Touch
                    </a>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
