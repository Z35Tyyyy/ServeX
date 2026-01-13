import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Clock, Bell, CheckCircle, RefreshCw, LogOut, Flame, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getKitchenOrders, updateOrderStatus } from '../../lib/api';
import { getSocket, connectSocket, joinKitchen, leaveKitchen } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';
import { timeAgo } from '../../lib/utils';

interface Order { _id: string; tableId: { tableNumber: number }; items: { name: string; quantity: number; specialInstructions?: string }[]; status: 'PAID' | 'PREPARING' | 'READY'; createdAt: string; }

const statusConfig = {
    PAID: { label: 'New', bg: 'rgba(139, 92, 246, 0.15)', border: 'var(--color-primary)', color: 'var(--color-primary-light)', nextLabel: 'Start Preparing', gradient: 'var(--gradient-primary)' },
    PREPARING: { label: 'Preparing', bg: 'rgba(234, 179, 8, 0.15)', border: 'var(--color-warning)', color: 'var(--color-warning)', nextLabel: 'Mark Ready', gradient: 'var(--gradient-secondary)' },
    READY: { label: 'Ready', bg: 'rgba(34, 197, 94, 0.15)', border: 'var(--color-success)', color: 'var(--color-success)', nextLabel: 'Mark Served', gradient: 'var(--gradient-success)' },
};

export default function KitchenDashboard() {
    const navigate = useNavigate();
    const { token, logout, user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => { setLoading(true); getKitchenOrders().then((r) => { setOrders(r.data); setLoading(false); }); };
    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        if (!token) return;
        connectSocket();
        const socket = getSocket();
        joinKitchen(token);
        socket.on('order:new', (d: { order: Order }) => { setOrders((prev) => [d.order, ...prev]); toast.success(`🔔 New order from Table ${d.order.tableId?.tableNumber}!`); new Audio('/notification.mp3').play().catch(() => { }); });
        socket.on('order:statusUpdate', (d: { orderId: string; status: string }) => { setOrders((prev) => prev.map((o) => o._id === d.orderId ? { ...o, status: d.status as Order['status'] } : o).filter((o) => o.status !== 'SERVED')); });
        return () => { leaveKitchen(); socket.off('order:new'); socket.off('order:statusUpdate'); };
    }, [token]);

    const handleUpdate = async (id: string, status: string) => { await updateOrderStatus(id, status); if (status === 'SERVED') { setOrders((prev) => prev.filter((o) => o._id !== id)); toast.success('✅ Order served!'); } };
    const getNext = (s: string) => ({ PAID: 'PREPARING', PREPARING: 'READY', READY: 'SERVED' }[s]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-dark)' }}>
            {/* Background */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--gradient-mesh)', pointerEvents: 'none' }} />

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user?.role === 'admin' && <button onClick={() => navigate('/admin')} className="btn btn-ghost" style={{ padding: 8 }}><ArrowLeft size={20} /></button>}
                    <div className="animate-float" style={{ width: 48, height: 48, background: 'var(--gradient-primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow-sm)' }}><ChefHat size={24} color="white" /></div>
                    <div><h1 style={{ fontSize: 22, fontWeight: 800 }}><span className="text-gradient">Kitchen</span></h1><p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Welcome, {user?.name}</p></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: 10 }}><RefreshCw size={18} /></button>
                    <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-ghost" style={{ padding: '10px 16px' }}><LogOut size={18} /></button>
                </div>
            </header>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: 24, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)' }}>
                {[
                    { status: 'PAID', label: 'New', icon: Flame },
                    { status: 'PREPARING', label: 'Cooking', icon: ChefHat },
                    { status: 'READY', label: 'Ready', icon: Bell },
                ].map(({ status, label, icon: Icon }) => (
                    <div key={status} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                            <Icon size={20} style={{ color: statusConfig[status as keyof typeof statusConfig].color }} />
                            <span style={{ fontSize: 36, fontWeight: 800, color: statusConfig[status as keyof typeof statusConfig].color }}>{orders.filter((o) => o.status === status).length}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Orders */}
            <main style={{ padding: 24, position: 'relative' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--color-text-muted)' }}><ChefHat className="animate-spin" size={48} /></div>
                ) : orders.length === 0 ? (
                    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 64, textAlign: 'center' }}>
                        <div className="animate-float" style={{ fontSize: 64, marginBottom: 24 }}>🍳</div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No active orders</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>New orders will appear here in real-time</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                        {orders.map((order, idx) => {
                            const config = statusConfig[order.status];
                            return (
                                <div key={order._id} className="animate-scaleIn" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: `2px solid ${config.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 30px ${config.bg}`, animationDelay: `${idx * 50}ms` }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: config.bg }}>
                                        <span style={{ fontSize: 28, fontWeight: 800 }}>Table {order.tableId?.tableNumber}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)' }}><Clock size={14} />{timeAgo(order.createdAt)}</span>
                                    </div>

                                    {/* Items */}
                                    <div style={{ padding: 16, maxHeight: 220, overflowY: 'auto' }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < order.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                                <span style={{ fontWeight: 800, color: config.color, minWidth: 32, fontSize: 18 }}>{item.quantity}×</span>
                                                <div>
                                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                    {item.specialInstructions && <p style={{ fontSize: 13, color: 'var(--color-warning)', background: 'rgba(234, 179, 8, 0.1)', padding: '6px 10px', borderRadius: 8, marginTop: 6 }}>📝 {item.specialInstructions}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTop: '1px solid var(--color-border)' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>{config.label}</span>
                                        {getNext(order.status) && (
                                            <button onClick={() => handleUpdate(order._id, getNext(order.status)!)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, background: config.gradient, color: 'white', cursor: 'pointer', boxShadow: `0 0 20px ${config.bg}` }}>
                                                {order.status === 'READY' && <CheckCircle size={18} />}
                                                {config.nextLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
