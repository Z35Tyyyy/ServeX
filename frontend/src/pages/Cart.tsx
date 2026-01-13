import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Loader2, Receipt, ShoppingBag, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../lib/api';
import { formatPrice, getSessionId } from '../lib/utils';

export default function Cart() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, getSubtotal, getTax, getServiceCharge, getTotal } = useCartStore();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!tableId || items.length === 0) return;
        setLoading(true);
        try {
            const res = await createOrder({ tableId, items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, specialInstructions: i.specialInstructions })), sessionId: getSessionId(tableId) });
            navigate(`/payment/${res.data.order._id}`);
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to create order'); setLoading(false); }
    };

    if (items.length === 0) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div className="animate-float" style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>Add some delicious items!</p>
            <button onClick={() => navigate(`/menu/${tableId}`)} className="btn btn-primary btn-lg">
                <ShoppingBag size={20} /> Browse Menu
            </button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(`/menu/${tableId}`)} className="btn btn-secondary" style={{ padding: 10 }}><ArrowLeft size={20} /></button>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800 }}><span className="text-gradient">Your Cart</span></h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{items.length} items</p>
                </div>
            </header>

            {/* Items */}
            <div style={{ padding: 16 }}>
                {items.map((item, idx) => (
                    <div key={item.menuItemId} className="card animate-slideUp" style={{ display: 'flex', gap: 16, padding: 16, marginBottom: 12, animationDelay: `${idx * 50}ms` }}>
                        <div style={{ width: 70, height: 70, background: 'var(--gradient-primary-subtle)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : '🍽️'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.name}</h3>
                            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary-light)' }}>{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-tertiary)', borderRadius: 10, padding: 4, border: '1px solid var(--color-border)' }}>
                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 8 }}><Minus size={16} /></button>
                                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 8 }}><Plus size={16} /></button>
                            </div>
                            <button onClick={() => removeItem(item.menuItemId)} style={{ color: 'var(--color-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={14} /> Remove</button>
                        </div>
                    </div>
                ))}

                {/* Bill Summary */}
                <div className="card" style={{ padding: 24, marginTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <Receipt size={20} style={{ color: 'var(--color-primary-light)' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Bill Summary</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'var(--color-text-secondary)' }}><span>Subtotal</span><span>{formatPrice(getSubtotal())}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'var(--color-text-secondary)' }}><span>Tax (5%)</span><span>{formatPrice(getTax())}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: 'var(--color-text-secondary)' }}><span>Service Charge (5%)</span><span>{formatPrice(getServiceCharge())}</span></div>
                    </div>

                    <div className="divider" />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>Total</span>
                        <span style={{ fontSize: 28, fontWeight: 800 }}><span className="text-gradient">{formatPrice(getTotal())}</span></span>
                    </div>
                </div>
            </div>

            {/* Checkout Bar */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', padding: 16 }}
                >
                    {loading ? (
                        <><Loader2 className="animate-spin" size={20} /> Processing...</>
                    ) : (
                        <><Sparkles size={20} /> Pay {formatPrice(getTotal())}</>
                    )}
                </button>
            </div>
        </div>
    );
}
