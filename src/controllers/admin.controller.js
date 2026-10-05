import { pool } from '../config/db.js';

// GET /api/admin/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function getStats(req, res) {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';

  const [porPublicacion] = await pool.query(`
    SELECT t.id, t.title, t.file_type, t.created_at,
           COUNT(v.id) AS total_views
    FROM trainings t
    LEFT JOIN trainings_views v ON v.training_id = t.id
    GROUP BY t.id
    ORDER BY total_views DESC
  `);

  const [porDia] = await pool.query(`
    SELECT DATE(viewed_at) AS dia,
           COUNT(*) AS vistas,
           COUNT(DISTINCT training_id) AS publicaciones_vistas,
           COUNT(DISTINCT viewer_token) AS visitantes_unicos
    FROM trainings_views
    WHERE viewed_at BETWEEN ? AND ?
    GROUP BY DATE(viewed_at)
    ORDER BY dia ASC
  `, [`${from} 00:00:00`, `${to} 23:59:59`]);

  const [detalle] = await pool.query(`
    SELECT t.id, t.title, DATE(v.viewed_at) AS dia, COUNT(*) AS vistas
    FROM trainings t
    JOIN trainings_views v ON v.training_id = t.id
    WHERE v.viewed_at BETWEEN ? AND ?
    GROUP BY t.id, DATE(v.viewed_at)
    ORDER BY dia ASC
  `, [`${from} 00:00:00`, `${to} 23:59:59`]);

  res.json({ porPublicacion, porDia, detalle });
}