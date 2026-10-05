import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/auth.routes.js';
import trainingRoutes from './src/routes/trainings.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: 'http://localhost:5174' })); // en producción, tu dominio del front
app.use(express.json());

// Servir archivos subidos
app.use(
  `/${process.env.UPLOAD_DIR || 'uploads'}`,
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'))
);

app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_, res) => res.json({ ok: true, service: 'capacitaciones-api' }));

// Manejo de errores (multer, etc.)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));