import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, Wifi, Clock, Shield, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { getTable } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { setSessionToken } from '../lib/utils';

export default function TableLanding() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const setTableId = useCartStore((s) => s.setTableId);
    const [table, setTable] = useState<{ tableNumber: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tableId) { setError('Invalid table'); setLoading(false); return; }
        getTable(tableId)
            .then((r) => {
                setTable(r.data);
                setTableId(tableId);
                // Store session token from server (CRITICAL for order security)
                if (r.data.sessionToken) {
                    setSessionToken(tableId, r.data.sessionToken);
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Table not found');
                setLoading(false);
            });
    }, [tableId, setTableId]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'var(--gradient-primary)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'glow 2s ease-in-out infinite' }}><Utensils size={40} color="white" /></div>
                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 64 }}>😕</div>
            <h2 style={{ fontSize: 24 }}>{error}</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Please scan a valid QR code</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ position: 'fixed', top: '-50%', right: '-30%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-30%', left: '-20%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="animate-fadeIn" style={{ textAlign: 'center', maxWidth: 400, position: 'relative' }}>
                <div className="animate-float" style={{ width: 100, height: 100, background: 'var(--gradient-primary)', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: 'var(--shadow-glow)' }}>
                    <Utensils size={50} color="white" />
                </div>

                <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>
                    <span className="text-gradient">ServeX</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 40, fontSize: 18 }}>Digital Dining Experience</p>

                <div className="card" style={{ padding: 24, marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                        <Sparkles size={20} style={{ color: 'var(--color-warning)' }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>You're at</span>
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>
                        <span className="text-gradient">Table {table?.tableNumber}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
                    {[
                        { icon: Wifi, label: 'Instant' },
                        { icon: Clock, label: 'Fast' },
                        { icon: Shield, label: 'Secure' },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} style={{ padding: 16, background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 16, textAlign: 'center' }}>
                            <Icon size={24} style={{ color: 'var(--color-primary-light)', marginBottom: 8 }} />
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate(`/menu/${tableId}`)}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', padding: '18px 32px', fontSize: 18, borderRadius: 16 }}
                >
                    <span>View Menu</span>
                    <ChevronRight size={24} />
                </button>

                <p style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Browse • Order • Pay • Enjoy
                </p>
            </div>
        </div>
    );
}
