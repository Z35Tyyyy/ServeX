import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, Loader2 } from 'lucide-react';
import { getTable } from '../lib/api';
import { useCartStore } from '../store/cartStore';

export default function TableLanding() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const setTableId = useCartStore((s) => s.setTableId);
    const [table, setTable] = useState<{ tableNumber: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tableId) { setError('Invalid table'); setLoading(false); return; }
        getTable(tableId).then((r) => { setTable(r.data); setTableId(tableId); setLoading(false); }).catch(() => { setError('Table not found'); setLoading(false); });
    }, [tableId, setTableId]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} /></div>;
    if (error) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}><p>{error}</p></div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ width: 80, height: 80, background: 'var(--gradient-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Utensils size={40} color="white" /></div>
                <h1 style={{ fontSize: 32, marginBottom: 8, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ServeX</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>Welcome to Table {table?.tableNumber}</p>
                <button onClick={() => navigate(`/menu/${tableId}`)} style={{ width: '100%', padding: 16, background: 'var(--gradient-primary)', color: 'white', fontSize: 18, fontWeight: 600, borderRadius: 16, cursor: 'pointer' }}>View Menu</button>
            </div>
        </div>
    );
}
