import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '24px',
            color: 'var(--color-text-muted)',
            fontSize: 12,
            marginTop: 'auto',
            width: '100%',
            opacity: 0.8
        }}>
            <span>Made with</span>
            <Heart size={12} fill="currentColor" style={{ color: 'var(--color-error)' }} />
            <span>by Z35Tyyyy</span>
        </div>
    );
}
