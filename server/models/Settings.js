import pool from '../config/database.js';

export const getSetting = async (key) => {
  const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  if (result.rows.length === 0) return null;
  return result.rows[0].value;
};

export const getAllSettings = async () => {
  const result = await pool.query('SELECT key, value FROM settings');
  const settings = {};
  result.rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
};

export const updateSetting = async (key, value) => {
  const result = await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP RETURNING *',
    [key, value]
  );
  return result.rows[0];
};

export const updateMultipleSettings = async (settings) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
        [key, typeof value === 'object' ? JSON.stringify(value) : value]
      );
    }
    
    await client.query('COMMIT');
    return await getAllSettings();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

