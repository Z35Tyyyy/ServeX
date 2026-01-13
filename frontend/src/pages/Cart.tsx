import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
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
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
            <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
            <button onClick={() => navigate(`/menu/${tableId}`)} className="btn btn-primary btn-lg mt-lg">Browse Menu</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(`/menu/${tableId}`)} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 12 }}><ArrowLeft size={20} /></button>
                <h1 style={{ fontSize: 20 }}>Your Cart</h1>
            </header>
            <div style={{ padding: 16 }}>
                {items.map((item) => (
                    <div key={item.menuItemId} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}><h3 style={{ fontSize: 16 }}>{item.name}</h3><p style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{formatPrice(item.price)}</p></div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-tertiary)', borderRadius: 8, padding: 4 }}>
                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 4 }}><Minus size={14} /></button>
                                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 4 }}><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeItem(item.menuItemId)} style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
                    <h3 style={{ marginBottom: 16 }}>Bill Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}><span>Subtotal</span><span>{formatPrice(getSubtotal())}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}><span>Tax (5%)</span><span>{formatPrice(getTax())}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14, color: 'var(--color-text-secondary)' }}><span>Service (5%)</span><span>{formatPrice(getServiceCharge())}</span></div>
                    <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 16 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}><span>Total</span><span>{formatPrice(getTotal())}</span></div>
                </div>
            </div>
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'rgba(15, 23, 42, 0.98)', borderTop: '1px solid var(--color-border)' }}>
                <button onClick={handleCheckout} disabled={loading} style={{ width: '100%', padding: 16, background: 'var(--gradient-primary)', color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{loading ? <><Loader2 className="animate-spin" size={20} />Processing...</> : `Pay ${formatPrice(getTotal())}`}</button>
            </div>
        </div>
    );
}
