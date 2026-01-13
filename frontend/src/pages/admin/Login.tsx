import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill all fields'); return; }
        setLoading(true);
        try {
            const { data } = await login(email, password);
            setAuth(data.user, data.token);
            toast.success(`Welcome, ${data.user.name}!`);
            navigate(data.user.role === 'admin' ? '/admin' : '/kitchen');
        } catch (e: any) { toast.error(e.response?.data?.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 400, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'var(--gradient-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Utensils size={32} color="white" /></div>
                <h1 style={{ fontSize: 24, marginBottom: 8 }}>ServeX Staff</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Sign in to access the dashboard</p>
                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: 'var(--color-text-secondary)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" style={{ width: '100%', padding: '12px 12px 12px 44px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontSize: 14 }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: 'var(--color-text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', padding: '12px 12px 12px 44px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontSize: 14 }} />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: 'var(--gradient-primary)', color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{loading ? <><Loader2 className="animate-spin" size={20} />Signing in...</> : 'Sign In'}</button>
                </form>
                <div style={{ marginTop: 24, padding: 12, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 8, textAlign: 'left', fontSize: 12 }}>
                    <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary)' }}>Demo Credentials:</p>
                    <p style={{ color: 'var(--color-text-muted)' }}><strong style={{ color: 'var(--color-primary-light)' }}>Admin:</strong> admin@servex.com / admin123</p>
                    <p style={{ color: 'var(--color-text-muted)' }}><strong style={{ color: 'var(--color-primary-light)' }}>Kitchen:</strong> kitchen@servex.com / kitchen123</p>
                </div>
            </div>
        </div>
    );
}
