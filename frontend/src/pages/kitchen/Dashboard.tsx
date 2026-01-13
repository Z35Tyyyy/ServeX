import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Clock, Bell, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { getKitchenOrders, updateOrderStatus } from '../../lib/api';
import { getSocket, connectSocket, joinKitchen, leaveKitchen } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';
import { timeAgo } from '../../lib/utils';

interface Order { _id: string; tableId: { tableNumber: number }; items: { name: string; quantity: number; specialInstructions?: string }[]; status: 'PAID' | 'PREPARING' | 'READY'; createdAt: string; }

export default function KitchenDashboard() {
    const navigate = useNavigate();
    const { token, logout, user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => { getKitchenOrders().then((r) => { setOrders(r.data); setLoading(false); }); };
    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        if (!token) return;
        connectSocket();
        const socket = getSocket();
        joinKitchen(token);
        socket.on('order:new', (d: { order: Order }) => { setOrders((prev) => [d.order, ...prev]); toast.success(`New order from Table ${d.order.tableId?.tableNumber}!`, { icon: '🔔' }); });
        socket.on('order:statusUpdate', (d: { orderId: string; status: string }) => { setOrders((prev) => prev.map((o) => o._id === d.orderId ? { ...o, status: d.status as Order['status'] } : o).filter((o) => o.status !== 'SERVED')); });
        return () => { leaveKitchen(); socket.off('order:new'); socket.off('order:statusUpdate'); };
    }, [token]);

    const handleUpdate = async (id: string, status: string) => { await updateOrderStatus(id, status); if (status === 'SERVED') { setOrders((prev) => prev.filter((o) => o._id !== id)); toast.success('Marked as served'); } };
    const getNext = (s: string) => ({ PAID: 'PREPARING', PREPARING: 'READY', READY: 'SERVED' }[s]);
    const getBtn = (s: string) => ({ PAID: 'Start Preparing', PREPARING: 'Mark Ready', READY: 'Mark Served' }[s]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gradient-dark)' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ChefHat size={28} style={{ color: 'var(--color-primary-light)' }} /><div><h1 style={{ fontSize: 20 }}>Kitchen Dashboard</h1><p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Welcome, {user?.name}</p></div></div>
                <div style={{ display: 'flex', gap: 8 }}><button onClick={fetchOrders} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-secondary)' }}><RefreshCw size={20} /></button><button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-secondary)' }}><LogOut size={18} />Logout</button></div>
            </header>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: 16, background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary-light)' }}>{orders.filter((o) => o.status === 'PAID').length}</p><p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>New</p></div>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-warning)' }}>{orders.filter((o) => o.status === 'PREPARING').length}</p><p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Preparing</p></div>
                <div style={{ textAlign: 'center' }}><p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-success)' }}>{orders.filter((o) => o.status === 'READY').length}</p><p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ready</p></div>
            </div>
            <main style={{ padding: 24 }}>
                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>Loading...</div> : orders.length === 0 ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, color: 'var(--color-text-muted)' }}><Bell size={48} /><h2 style={{ marginTop: 16, color: 'var(--color-text-primary)' }}>No active orders</h2><p>New orders will appear in real-time</p></div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {orders.map((order) => (
                            <div key={order._id} style={{ background: 'var(--color-bg-card)', border: `2px solid ${order.status === 'PAID' ? 'var(--color-primary)' : order.status === 'PREPARING' ? 'var(--color-warning)' : 'var(--color-success)'}`, borderRadius: 16, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-tertiary)' }}><span style={{ fontSize: 20, fontWeight: 700 }}>Table {order.tableId?.tableNumber}</span><span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}><Clock size={14} />{timeAgo(order.createdAt)}</span></div>
                                <div style={{ padding: 16, maxHeight: 200, overflowY: 'auto' }}>{order.items.map((item, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><span style={{ fontWeight: 700, color: 'var(--color-primary-light)', minWidth: 28 }}>{item.quantity}x</span><div><span style={{ fontWeight: 500 }}>{item.name}</span>{item.specialInstructions && <p style={{ fontSize: 12, color: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: 4, marginTop: 4 }}>📝 {item.specialInstructions}</p>}</div></div>)}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
                                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: order.status === 'PAID' ? 'rgba(99, 102, 241, 0.2)' : order.status === 'PREPARING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: order.status === 'PAID' ? 'var(--color-primary-light)' : order.status === 'PREPARING' ? 'var(--color-warning)' : 'var(--color-success)' }}>{order.status === 'PAID' ? 'New Order' : order.status === 'PREPARING' ? 'Preparing' : 'Ready'}</span>
                                    {getNext(order.status) && <button onClick={() => handleUpdate(order._id, getNext(order.status)!)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, background: order.status === 'PAID' ? 'var(--gradient-primary)' : order.status === 'PREPARING' ? 'var(--gradient-secondary)' : 'var(--gradient-success)', color: 'white', cursor: 'pointer' }}>{order.status === 'READY' && <CheckCircle size={16} />}{getBtn(order.status)}</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
