const crypto = require('crypto');
const db = require('../../config/database');
const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const { signToken } = require('../../utils/jwtHelpers');

async function register(name, email, password) {
  const existing = await db('users').where({ email }).first();
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const [user] = await db('users')
    .insert({ name, email, password_hash })
    .returning(['id', 'name', 'email', 'avatar_url', 'plan', 'created_at']);

  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

async function login(email, password) {
  const user = await db('users').where({ email }).first();
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  const token = signToken({ userId: user.id, email: user.email });
  return { user: safeUser, token };
}

async function getProfile(userId) {
  const user = await db('users')
    .where({ id: userId })
    .select('id', 'name', 'email', 'avatar_url', 'plan', 'created_at', 'updated_at')
    .first();

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}

async function updateProfile(userId, data) {
  const [user] = await db('users')
    .where({ id: userId })
    .update({ ...data, updated_at: db.fn.now() })
    .returning(['id', 'name', 'email', 'avatar_url', 'plan', 'created_at', 'updated_at']);
  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await db('users').where({ id: userId }).first();

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  const password_hash = await hashPassword(newPassword);
  await db('users').where({ id: userId }).update({ password_hash, updated_at: db.fn.now() });
  return { message: 'Password changed successfully' };
}

async function forgotPassword(email) {
  const user = await db('users').where({ email }).first();
  if (!user) return { message: 'If that email exists, a reset link was sent.' };

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 60 * 60 * 1000);

  await db('password_reset_tokens').insert({ user_id: user.id, token, expires_at });
  console.log(`[DEV] Password reset token for ${email}: ${token}`);

  return { message: 'If that email exists, a reset link was sent.' };
}

async function resetPassword(token, newPassword) {
  const record = await db('password_reset_tokens')
    .where({ token, used: false })
    .where('expires_at', '>', db.fn.now())
    .first();

  if (!record) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }

  const password_hash = await hashPassword(newPassword);
  await db('users').where({ id: record.user_id }).update({ password_hash, updated_at: db.fn.now() });
  await db('password_reset_tokens').where({ id: record.id }).update({ used: true });

  return { message: 'Password reset successfully' };
}

module.exports = { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword };
