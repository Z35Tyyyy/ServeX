import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react';
import { getMenu, getMenuCategories } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';

interface MenuItem { _id: string; name: string; description: string; category: string; price: number; imageUrl: string; tags: string[]; }

export default function Menu() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { items: cartItems, addItem, updateQuantity, getItemCount } = useCartStore();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMenu(), getMenuCategories()]).then(([m, c]) => { setMenuItems(m.data); setCategories(['All', ...c.data]); setLoading(false); });
    }, []);

    const filteredItems = menuItems.filter((i) => selectedCategory === 'All' || i.category === selectedCategory);
    const getQty = (id: string) => cartItems.find((i) => i.menuItemId === id)?.quantity || 0;

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} /></div>;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
            <header style={{ padding: 16, background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <h1 style={{ fontSize: 24 }}>Menu</h1>
            </header>
            <div style={{ display: 'flex', gap: 8, padding: 16, overflowX: 'auto' }}>
                {categories.map((c) => <button key={c} onClick={() => setSelectedCategory(c)} style={{ padding: '8px 16px', background: selectedCategory === c ? 'var(--gradient-primary)' : 'var(--color-bg-secondary)', color: selectedCategory === c ? 'white' : 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 999, whiteSpace: 'nowrap', fontSize: 14 }}>{c}</button>)}
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 16 }}>
                {filteredItems.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                        <div style={{ width: 80, height: 80, background: 'var(--color-bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🍽️'}</div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 16, marginBottom: 4 }}>{item.name}</h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>{item.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{formatPrice(item.price)}</span>
                                {getQty(item._id) === 0 ? (
                                    <button onClick={() => addItem({ menuItemId: item._id, name: item.name, price: item.price, imageUrl: item.imageUrl })} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--gradient-primary)', color: 'white', borderRadius: 8, fontSize: 14 }}><Plus size={14} /> Add</button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-tertiary)', borderRadius: 8, padding: 4 }}>
                                        <button onClick={() => updateQuantity(item._id, getQty(item._id) - 1)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 4 }}><Minus size={14} /></button>
                                        <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{getQty(item._id)}</span>
                                        <button onClick={() => updateQuantity(item._id, getQty(item._id) + 1)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 4 }}><Plus size={14} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {getItemCount() > 0 && <button onClick={() => navigate(`/cart/${tableId}`)} style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--gradient-primary)', color: 'white', borderRadius: 999, fontWeight: 600, boxShadow: 'var(--shadow-lg)', zIndex: 100 }}><ShoppingCart size={20} /><span>View Cart</span><span style={{ background: 'white', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 999, fontSize: 14 }}>{getItemCount()}</span></button>}
        </div>
    );
}
