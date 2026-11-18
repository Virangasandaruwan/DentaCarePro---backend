import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import packageRoutes from './routes/packageRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import treatmentRoutes from './routes/treatmentRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'DentaCare Pro Backend Online' });
});

app.get('/', (_req, res) => {
  res.send('DentaCare Pro API Running');
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('==============================================');
  console.log(' Database Ready (Built-in Persistent Storage)');
  console.log(` Server running on http://localhost:${PORT}`);
  console.log('==============================================');
});
