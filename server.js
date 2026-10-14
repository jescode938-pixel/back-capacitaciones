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

// Acepta cualquier localhost y cualquier IP de red local (192.168.x.x, 10.x.x.x)
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,   // ← cubre 192.168.0.105
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const permitido = allowedOrigins.some((patron) =>
        typeof patron === 'string' ? patron === origin : patron.test(origin)
      );
      if (permitido) return callback(null, true);
      callback(new Error('No permitido por CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// Servir archivos subidos
//app.use(
  //`/${process.env.UPLOAD_DIR || 'uploads'}`,
  //express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'))
//);

app.use('/api/auth', authRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_, res) => res.json({ ok: true, service: 'capacitaciones-api' }));

// Manejo de errores (multer, etc.)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 3000;

// Escucha en todas las interfaces para que el celular lo alcance por la IP local
app.listen(PORT, '0.0.0.0', () =>
  console.log(`API escuchando en http://localhost:${PORT}`)
);