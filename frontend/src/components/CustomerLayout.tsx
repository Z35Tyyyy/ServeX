import { Outlet } from 'react-router-dom';
import Footer from './Footer';

export default function CustomerLayout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Outlet />
            <Footer />
        </div>
    );
}
