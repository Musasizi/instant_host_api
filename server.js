/**
 * server.js – Ostello API Entry Point
 *
 * Hostel Discovery & Booking Platform
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Import route groups
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// ─── Create Express Application ──────────────────────────────────────────────
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ─── Health-Check Route ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Ostello API is running 🏠', status: 'ok' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', authRoutes);      // /api/register, /api/login, /api/verify-email, etc.
app.use('/api', userRoutes);      // /api/users/me, /api/users, /api/users/:id
app.use('/api', hostelRoutes);    // /api/hostels, /api/hostels/:id
app.use('/api', roomRoutes);      // /api/hostels/:id/rooms, /api/rooms/:id
app.use('/api', bookingRoutes);   // /api/bookings, /api/bookings/:id
app.use('/api', paymentRoutes);   // /api/payments, /api/payments/:id
app.use('/api', reviewRoutes);    // /api/reviews, /api/hostels/:id/reviews

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Any request that does not match a registered route falls through to here.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Express recognises a function with FOUR parameters as an error handler.
// Call next(err) from any middleware/controller to land here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
