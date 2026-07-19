import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { FaPlus, FaMinus, FaTrash, FaShoppingBag, FaArrowRight } from 'react-icons/fa';

interface CartItem {
    id: number | string;
    name: string;
    image: string;
    category: string;
    price: number;
    quantity: number;
}

const Cart: React.FC = () => {
    const { t } = useTranslation();
    const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart() as {
        items: CartItem[];
        updateQuantity: (id: number | string, quantity: number) => void;
        removeFromCart: (id: number | string) => void;
        getTotalPrice: () => number;
        clearCart: () => void;
    };

    const handleQuantityChange = (productId: number | string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const subtotal = getTotalPrice();
    const shippingCost = subtotal > 1999 ? 0 : 250;
    const total = subtotal + shippingCost;

    if (items.length === 0) {
        return (
            <div className="cart-page empty islamic-pattern">
                <style>{`
          .cart-page { padding: 120px 0; min-height: 80vh; color: #000000; }
          .cart-page h1, .cart-page h2, .cart-page h3, .cart-page h4, .cart-page h5, .cart-page h6, .cart-page p, .cart-page span, .cart-page div { color: #000000; }
          .empty-cart-card {
            background: white;
            padding: 80px 40px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
          }
          .empty-cart-icon {
            font-size: 5rem;
            color: rgba(44, 85, 48, 0.1);
            margin-bottom: 30px;
          }
        `}</style>
                <div className="container">
                    <div className="empty-cart-card">
                        <div className="empty-cart-icon"><FaShoppingBag /></div>
                        <h2 className="premium-font" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{t('cart.emptyCartTitle')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>{t('cart.emptyCartSubtitle')}</p>
                        <Link to="/shop-islamic" className="btn btn-primary" style={{
                            display: 'inline-block',
                            backgroundColor: '#108960',
                            color: 'white',
                            padding: '12px 30px',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '1rem',
                            boxShadow: '0 4px 15px rgba(16, 137, 96, 0.2)'
                        }}>{t('cart.continueExploringBtn')}</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page islamic-pattern">
            <style>{`
        .cart-page { padding: 80px 0; color: #000000; background-color: #f8f9fa; min-height: 90vh; }
        .cart-page h1, .cart-page h2, .cart-page h3, .cart-page h4, .cart-page h5, .cart-page h6, .cart-page p, .cart-page span, .cart-page div, .cart-page a { color: #000000; }
        .cart-title { font-size: 2.8rem; margin-bottom: 40px; color: #000000; font-weight: 700; text-align: center; }
        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        .cart-items {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .cart-item {
          display: flex;
          padding: 30px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          align-items: center;
          gap: 30px;
          transition: background 0.2s;
        }
        .cart-item:hover {
          background: #fafafa;
        }
        .cart-item:last-child {
          border-bottom: none;
        }
        .cart-item-image {
          width: 140px;
          height: 140px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .cart-item-info { flex: 1; color: #333; }
        .cart-item-info h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 10px; color: #333; font-weight: 600; }
        .qty-controls {
          display: flex;
          align-items: center;
          background: #f0f0f0;
          border-radius: 50px;
          padding: 6px;
        }
        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: white;
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .qty-btn:hover { background: #333; color: white; transform: translateY(-2px); }
        .qty-val { font-weight: 700; width: 40px; text-align: center; font-size: 1.1rem; }

        .summary-card {
          background: white;
          color: #000000;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          position: sticky;
          top: 100px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          opacity: 1;
          color: #000000;
          font-size: 1.05rem;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 30px;
          border-top: 2px solid #f0f0f0;
          font-size: 1.8rem;
          font-family: 'Playfair Display', serif;
          color: #000000;
          font-weight: 700;
        }
        @media (max-width: 1100px) {
          .cart-grid { grid-template-columns: 1fr; }
          .summary-card { margin-top: 40px; }
        }
      `}</style>
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>


                <div className="cart-grid">
                    <div className="cart-items">
                        {items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-image" />
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 600 }}>{item.category}</p>
                                    <p style={{ fontWeight: '700', color: '#000000', marginTop: '12px', fontSize: '1.2rem' }}>PKR {item.price.toLocaleString()}</p>
                                </div>

                                <div className="qty-controls">
                                    <button className="qty-btn" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}><FaMinus size={10} /></button>
                                    <span className="qty-val">{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><FaPlus size={10} /></button>
                                </div>

                                <button className="btn" style={{ padding: '12px', borderRadius: '50%', background: 'transparent', color: '#d32f2f', transition: 'color 0.2s' }} onClick={() => removeFromCart(item.id)}>
                                    <FaTrash size={18} className="trash-icon" />
                                </button>
                                <style>{` .trash-icon:hover { color: #b71c1c; } `}</style>
                            </div>
                        ))}
                        {items.length > 0 && (
                            <div style={{ padding: '30px', textAlign: 'right', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                                <button className="btn" style={{ border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer', background: 'transparent' }} onClick={clearCart}>{t('cart.clearCartBtn')}</button>
                            </div>
                        )}
                    </div>

                    <div className="summary-card">
                        <h3 className="premium-font" style={{ fontSize: '1.8rem', marginBottom: '25px', color: '#000000', letterSpacing: '-0.5px' }}>{t('cart.orderSummaryTitle')}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px dashed #e0e0e0' }}>
                            <div className="summary-row">
                                <span style={{ color: '#555' }}>{t('cart.subtotalLabel')}</span>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>PKR {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span style={{ color: '#555' }}>{t('cart.shippingLabel')}</span>
                                {shippingCost === 0 ? (
                                    <span style={{ color: '#108960', fontWeight: 'bold', background: 'rgba(16, 137, 96, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{t('cart.complimentaryLabel')}</span>
                                ) : (
                                    <span style={{ fontWeight: 600 }}>PKR {shippingCost}</span>
                                )}
                            </div>
                        </div>

                        <div className="summary-total" style={{ borderTop: 'none', marginTop: '20px', paddingTop: '0', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('cart.totalLabel')}</span>
                            <span style={{ fontSize: '2rem', color: '#108960', fontWeight: 700 }}>PKR {total.toLocaleString()}</span>
                        </div>

                        <Link to="/checkout1" className="btn btn-primary" style={{ width: '85%', margin: '40px auto 0', background: '#108960', color: '#ffffff', padding: '18px', fontSize: '1.1rem', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(16, 137, 96, 0.2)' }}>
                            {t('cart.proceedToCheckoutBtn')} <FaArrowRight />
                        </Link>

                        <div style={{ marginTop: '30px', textAlign: 'center', opacity: '0.7', fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span>🔒</span> {t('cart.secureCheckoutNote')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
