import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/index.js';
import { authRoutes, tableRoutes, menuRoutes, orderRoutes, paymentRoutes, setOrdersIO, setPaymentsIO } from './routes/index.js';
import { setupSocketIO } from './socket/index.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'] } });

setOrdersIO(io);
setPaymentsIO(io);
setupSocketIO(io);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`
===============================
🚀 ServeX Backend Running
📍 Port: ${PORT}
🌐 Frontend: ${process.env.FRONTEND_URL}
🔌 Socket.IO: Enabled
📦 MongoDB: Connected
===============================`);
    });
});
