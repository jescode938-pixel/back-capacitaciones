import { pool } from '../config/db.js';

// GET /api/trainings → lista pública
export async function listTrainings(req, res) {
  const [rows] = await pool.query(`
    SELECT t.id, t.title, t.description, t.file_url, t.file_type, t.created_at,
           COUNT(v.id) AS total_views
    FROM trainings t
    LEFT JOIN trainings_views v ON v.training_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);
  res.json(rows);
}

// GET /api/trainings/:id → detalle público
export async function getTraining(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(`
    SELECT t.id, t.title, t.description, t.file_url, t.file_type, t.created_at,
           COUNT(v.id) AS total_views
    FROM trainings t
    LEFT JOIN trainings_views v ON v.training_id = t.id
    WHERE t.id = ?
    GROUP BY t.id
  `, [id]);
  if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
  res.json(rows[0]);
}

// POST /api/trainings → crear (admin)
export async function createTraining(req, res) {
  const { title, description, file_type, youtube_id } = req.body;

  if (!title || !file_type || !youtube_id) {
    return res.status(400).json({ error: 'Faltan campos: title, file_type, youtube_id' });
  }

  const [result] = await pool.query(
    'INSERT INTO trainings (title, description, file_url, file_type, admin_id) VALUES (?, ?, ?, ?, ?)',
    [title, description || null, youtube_id, file_type, req.user.id]
  );

  res.status(201).json({
    id: result.insertId,
    title,
    description,
    file_url: youtube_id,
    file_type,
  });
}

// PUT /api/trainings/:id → editar (admin)
export async function updateTraining(req, res) {
  const { id } = req.params;
  const { title, description } = req.body;
  await pool.query(
    'UPDATE trainings SET title = ?, description = ? WHERE id = ?',
    [title, description || null, id]
  );
  res.json({ ok: true });
}

// DELETE /api/trainings/:id → eliminar (admin)
export async function deleteTraining(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM trainings WHERE id = ?', [id]);
  res.json({ ok: true });
}

// POST /api/trainings/:id/view → registrar vista
export async function registerView(req, res) {
  const { id } = req.params;
  const { viewer_token } = req.body;
  if (!viewer_token) return res.status(400).json({ error: 'viewer_token requerido' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  try {
    await pool.query(
      'INSERT INTO trainings_views (training_id, viewer_token, ip_address) VALUES (?, ?, ?)',
      [id, viewer_token, ip]
    );
  } catch (err) {
    // Duplicado por UNIQUE KEY → ya la vio, no suma
    if (err.code !== 'ER_DUP_ENTRY') throw err;
  }

  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM trainings_views WHERE training_id = ?',
    [id]
  );
  res.json({ total_views: rows[0].total });
}