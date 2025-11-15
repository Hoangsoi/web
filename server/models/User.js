import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query('SELECT id, name, email, phone, address, role, avatar, referral_code, balance, commission, created_at, updated_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (userData) => {
  const { name, email, password, phone, referralCode } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    'INSERT INTO users (name, email, password, phone, referral_code, balance, commission) VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING id, name, email, phone, role, referral_code, balance, commission, created_at',
    [name, email, hashedPassword, phone, referralCode]
  );
  return result.rows[0];
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const updateUser = async (id, userData) => {
  const { name, phone, address } = userData;
  const result = await pool.query(
    'UPDATE users SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, phone, address, role, avatar',
    [name, phone, address, id]
  );
  return result.rows[0];
};
