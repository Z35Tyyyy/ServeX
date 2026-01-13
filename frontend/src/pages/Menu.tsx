import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Loader2, Search, Flame, Leaf, X } from 'lucide-react';
import { getMenu, getMenuCategories } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';

interface MenuItem { _id: string; name: string; description: string; category: string; price: number; imageUrl: string; tags: string[]; }

export default function Menu() {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { items: cartItems, addItem, updateQuantity, getItemCount, getTotal } = useCartStore();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMenu(), getMenuCategories()]).then(([m, c]) => { setMenuItems(m.data); setCategories(['All', ...c.data]); setLoading(false); });
    }, []);

    const filteredItems = menuItems.filter((i) =>
        (selectedCategory === 'All' || i.category === selectedCategory) &&
        (searchQuery === '' || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const getQty = (id: string) => cartItems.find((i) => i.menuItemId === id)?.quantity || 0;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--color-primary)' }} />
                <p style={{ marginTop: 16, color: 'var(--color-text-muted)' }}>Loading delicious items...</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 120 }}>
            {/* Header */}
            <header style={{ padding: '20px 16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800 }}><span className="text-gradient">Menu</span></h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{menuItems.length} items available</p>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 42px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)', fontSize: 14 }}
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}><X size={18} /></button>}
                </div>
            </header>

            {/* Categories */}
            <div style={{ display: 'flex', gap: 8, padding: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {categories.map((c) => (
                    <button
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        style={{
                            padding: '10px 20px',
                            background: selectedCategory === c ? 'var(--gradient-primary)' : 'var(--glass-bg)',
                            backdropFilter: selectedCategory === c ? 'none' : 'var(--glass-blur)',
                            color: selectedCategory === c ? 'white' : 'var(--color-text-secondary)',
                            border: selectedCategory === c ? 'none' : '1px solid var(--glass-border)',
                            borderRadius: 999,
                            whiteSpace: 'nowrap',
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all var(--transition-base)',
                            boxShadow: selectedCategory === c ? 'var(--shadow-glow-sm)' : 'none'
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 16px' }}>
                {filteredItems.map((item, idx) => (
                    <div
                        key={item._id}
                        className="card animate-slideUp"
                        style={{
                            display: 'flex',
                            gap: 16,
                            padding: 16,
                            marginBottom: 12,
                            animationDelay: `${idx * 50}ms`
                        }}
                    >
                        {/* Image */}
                        <div style={{
                            width: 90,
                            height: 90,
                            background: 'var(--gradient-primary-subtle)',
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: 36,
                            overflow: 'hidden'
                        }}>
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>{item.name}</h3>
                                {item.tags.includes('bestseller') && <Flame size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />}
                                {item.tags.includes('veg') && <Leaf size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />}
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary-light)' }}>{formatPrice(item.price)}</span>

                                {getQty(item._id) === 0 ? (
                                    <button
                                        onClick={() => addItem({ menuItemId: item._id, name: item.name, price: item.price, imageUrl: item.imageUrl })}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            padding: '8px 16px',
                                            background: 'var(--gradient-primary)',
                                            color: 'white',
                                            borderRadius: 10,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            boxShadow: 'var(--shadow-glow-sm)'
                                        }}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg-tertiary)', borderRadius: 10, padding: 4, border: '1px solid var(--color-border)' }}>
                                        <button onClick={() => updateQuantity(item._id, getQty(item._id) - 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 8 }}><Minus size={16} /></button>
                                        <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{getQty(item._id)}</span>
                                        <button onClick={() => updateQuantity(item._id, getQty(item._id) + 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white', borderRadius: 8 }}><Plus size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
                        <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                        <p>No items found</p>
                    </div>
                )}
            </div>

            {/* Cart Button */}
            {getItemCount() > 0 && (
                <button
                    onClick={() => navigate(`/cart/${tableId}`)}
                    className="animate-slideUp"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        left: 16,
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        borderRadius: 16,
                        fontWeight: 600,
                        boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                        zIndex: 100
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={24} />
                            <span style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, background: 'white', color: 'var(--color-primary)', borderRadius: '50%', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getItemCount()}</span>
                        </div>
                        <span>View Cart</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{formatPrice(getTotal())}</span>
                </button>
            )}
        </div>
    );
}
