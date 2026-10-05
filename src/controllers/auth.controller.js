import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export async function login(req, res) {
  const { username, password } = req.body;
  console.log('🔵 Login intento:', { username, password: '***' });

  if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });

  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];

  console.log('🟡 Usuario encontrado:', user ? user.username : 'NO EXISTE');

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);

  console.log('🟢 Contraseña coincide:', ok);
  console.log('🟣 Hash en BD:', user.password_hash);
  console.log('🟣 Largo hash:', user.password_hash?.length);

  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}