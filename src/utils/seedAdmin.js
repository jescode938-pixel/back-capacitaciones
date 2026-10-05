import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

const hash = await bcrypt.hash(password, 10);

await pool.query(
  `INSERT INTO users (username, password_hash, role)
   VALUES (?, ?, 'admin')
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
  [username, hash]
);

console.log(`Admin listo → usuario: ${username} / contraseña: ${password}`);
process.exit(0);