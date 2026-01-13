import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, Bell, UtensilsCrossed, Loader2 } from 'lucide-react';
import { getOrder } from '../lib/api';
import { getSocket, connectSocket, joinOrderTracking, leaveOrderTracking } from '../lib/socket';
import { formatPrice, getStatusText, timeAgo } from '../lib/utils';

const steps = [{ status: 'PAID', label: 'Received', icon: CheckCircle }, { status: 'PREPARING', label: 'Preparing', icon: ChefHat }, { status: 'READY', label: 'Ready', icon: Bell }, { status: 'SERVED', label: 'Served', icon: UtensilsCrossed }];

export default function OrderTracking() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (orderId) getOrder(orderId).then((r) => { setOrder(r.data); setLoading(false); }).catch(() => setLoading(false)); }, [orderId]);

    useEffect(() => {
        if (!orderId) return;
        connectSocket();
        const socket = getSocket();
        joinOrderTracking(orderId);
        socket.on('order:statusUpdate', (d: { orderId: string; status: string }) => { if (d.orderId === orderId) setOrder((prev: any) => prev ? { ...prev, status: d.status } : null); });
        return () => { leaveOrderTracking(orderId); socket.off('order:statusUpdate'); };
    }, [orderId]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} /></div>;
    if (!order) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Order not found</p></div>;

    const currentIdx = steps.findIndex((s) => s.status === order.status);

    return (
        <div style={{ minHeight: '100vh', padding: 24 }}>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div><h1 style={{ fontSize: 20 }}>Order #{orderId?.slice(-6)}</h1><p style={{ color: 'var(--color-text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {timeAgo(order.createdAt)}</p></div>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'rgba(99, 102, 241, 0.2)', color: 'var(--color-primary-light)' }}>{getStatusText(order.status)}</span>
                </header>
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 24 }}>Order Status</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const done = i <= currentIdx;
                            return (
                                <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--gradient-primary)' : 'var(--color-bg-tertiary)', color: done ? 'white' : 'var(--color-text-muted)', border: done ? 'none' : '2px solid var(--color-border)' }}><Icon size={20} /></div>
                                    <span style={{ fontSize: 12, color: done ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Order Items</h3>
                    {order.items.map((i: any, idx: number) => <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}><span>{i.quantity}x {i.name}</span><span>{formatPrice(i.price * i.quantity)}</span></div>)}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 18, fontWeight: 700 }}><span>Total Paid</span><span style={{ color: 'var(--color-success)' }}>{formatPrice(order.totalAmount)}</span></div>
                </div>
            </div>
        </div>
    );
}
