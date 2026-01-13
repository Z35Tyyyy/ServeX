import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

interface MenuItem { _id: string; name: string; description: string; category: string; price: number; isAvailable: boolean; tags: string[]; }
interface FormData { name: string; description: string; category: string; price: string; tags: string; }

export default function MenuManagement() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [form, setForm] = useState<FormData>({ name: '', description: '', category: '', price: '', tags: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { getMenu().then((r) => { setItems(r.data); setLoading(false); }); }, []);

    const openModal = (item?: MenuItem) => {
        if (item) { setEditingItem(item); setForm({ name: item.name, description: item.description, category: item.category, price: item.price.toString(), tags: item.tags.join(', ') }); }
        else { setEditingItem(null); setForm({ name: '', description: '', category: '', price: '', tags: '' }); }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const data = { name: form.name, description: form.description, category: form.category, price: parseFloat(form.price), tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
        try {
            if (editingItem) { await updateMenuItem(editingItem._id, data); toast.success('Updated'); }
            else { await createMenuItem(data); toast.success('Created'); }
            setShowModal(false);
            getMenu().then((r) => setItems(r.data));
        } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const handleToggle = async (id: string) => { await toggleAvailability(id); setItems((prev) => prev.map((i) => i._id === id ? { ...i, isAvailable: !i.isAvailable } : i)); };
    const handleDelete = async (id: string) => { if (!confirm('Delete this item?')) return; await deleteMenuItem(id); setItems((prev) => prev.filter((i) => i._id !== id)); toast.success('Deleted'); };

    if (loading) return <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div style={{ padding: 32 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}><div><h1 style={{ fontSize: 24, marginBottom: 4 }}>Menu Management</h1><p style={{ color: 'var(--color-text-muted)' }}>{items.length} items</p></div><button onClick={() => openModal()} className="btn btn-primary"><Plus size={18} />Add Item</button></header>
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'var(--color-bg-tertiary)' }}><th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Item</th><th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Category</th><th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Price</th><th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Status</th><th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Actions</th></tr></thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: 16 }}><p style={{ fontWeight: 500 }}>{item.name}</p><p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.description}</p></td>
                                <td style={{ padding: 16 }}><span className="badge badge-primary">{item.category}</span></td>
                                <td style={{ padding: 16 }}>{formatPrice(item.price)}</td>
                                <td style={{ padding: 16 }}><button onClick={() => handleToggle(item._id)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: item.isAvailable ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{item.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}{item.isAvailable ? 'Available' : 'Unavailable'}</button></td>
                                <td style={{ padding: 16 }}><div style={{ display: 'flex', gap: 4 }}><button onClick={() => openModal(item)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-secondary)' }}><Edit2 size={16} /></button><button onClick={() => handleDelete(item._id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-error)' }}><Trash2 size={16} /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
                    <div style={{ width: '100%', maxWidth: 400, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--color-border)' }}><h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2><button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}><X size={20} /></button></div>
                        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
                            <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: 8, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }} /></div>
                            <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Category *</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={{ width: '100%', padding: 8, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }} /></div>
                            <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Price (₹) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ width: '100%', padding: 8, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }} /></div>
                            <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: 8, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }} /></div>
                            <div style={{ marginBottom: 16 }}><label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Tags (comma separated)</label><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="veg, spicy" style={{ width: '100%', padding: 8, background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)' }} /></div>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="animate-spin" size={18} /> : null}{editingItem ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
