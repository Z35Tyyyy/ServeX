import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrder, createPayment, verifyPayment } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';

declare global { interface Window { Razorpay: any; } }

export default function Payment() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const clearCart = useCartStore((s) => s.clearCart);
    const [order, setOrder] = useState<any>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'processing' | 'success' | 'failed'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) return;
        getOrder(orderId).then((r) => { if (r.data.status !== 'CREATED') navigate(`/order/${orderId}`); else { setOrder(r.data); setState('ready'); } }).catch(() => { setError('Order not found'); setState('failed'); });
    }, [orderId, navigate]);

    const handlePayment = async () => {
        if (!order || !orderId) return;
        setState('processing');
        try {
            const { data } = await createPayment(orderId);
            const options = {
                key: data.keyId, amount: data.amount, currency: data.currency, name: 'ServeX', order_id: data.razorpayOrderId,
                handler: async (res: any) => {
                    try { await verifyPayment({ orderId, razorpayOrderId: res.razorpay_order_id, razorpayPaymentId: res.razorpay_payment_id, razorpaySignature: res.razorpay_signature }); setState('success'); clearCart(); setTimeout(() => navigate(`/order/${orderId}`), 2000); }
                    catch { setError('Verification failed'); setState('failed'); }
                },
                modal: { ondismiss: () => setState('ready') },
                theme: { color: '#6366f1' },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            razorpay.on('payment.failed', (r: any) => { setError(r.error.description); setState('failed'); });
        } catch (e: any) { setError(e.response?.data?.message || 'Payment failed'); setState('failed'); }
    };

    if (state === 'loading') return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} /></div>;
    if (state === 'success') return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}><CheckCircle size={64} color="var(--color-success)" /><h2>Payment Successful!</h2><p className="text-muted">Redirecting...</p></div>;
    if (state === 'failed') return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}><XCircle size={64} color="var(--color-error)" /><h2>Payment Failed</h2><p className="text-muted">{error}</p><button onClick={() => { setState('ready'); setError(''); }} className="btn btn-primary mt-lg">Try Again</button></div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: 'var(--color-primary-light)' }}><CreditCard size={32} /><h1 style={{ fontSize: 24 }}>Payment</h1></div>
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                    <h3>Order #{orderId?.slice(-6)}</h3>
                    {order?.items.map((i: any, idx: number) => <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: 'var(--color-text-secondary)' }}><span>{i.quantity}x {i.name}</span><span>{formatPrice(i.price * i.quantity)}</span></div>)}
                    <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}><span>Total</span><span style={{ color: 'var(--color-primary-light)' }}>{formatPrice(order?.totalAmount || 0)}</span></div>
                </div>
                <button onClick={handlePayment} disabled={state === 'processing'} style={{ width: '100%', padding: 16, background: 'var(--gradient-primary)', color: 'white', fontSize: 18, fontWeight: 600, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{state === 'processing' ? <><Loader2 className="animate-spin" size={20} />Processing...</> : `Pay ${formatPrice(order?.totalAmount || 0)}`}</button>
            </div>
        </div>
    );
}
