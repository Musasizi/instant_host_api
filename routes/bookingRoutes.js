/**
 * routes/bookingRoutes.js – Booking Management Routes
 *
 * Protected (STUDENT):
 *   POST /api/bookings              → create booking
 *   GET  /api/bookings/my           → student's bookings
 *   PUT  /api/bookings/:id/cancel   → cancel booking
 *
 * Protected (CUSTODIAN):
 *   GET  /api/bookings/custodian        → custodian's bookings
 *   PUT  /api/bookings/:id/approve      → approve booking
 *   PUT  /api/bookings/:id/decline      → decline booking
 *
 * Protected (ADMIN):
 *   GET  /api/bookings                  → all bookings
 *
 * Protected (any):
 *   GET  /api/bookings/:id              → booking details
 */

const express = require('express');
const {
    createBooking, getMyBookings, getCustodianBookings,
    getBookingById, approveBooking, declineBooking, cancelBooking, getAllBookings,
} = require('../controllers/bookingController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Static routes before :id
router.get('/bookings/my', authenticateToken, authorize('STUDENT'), getMyBookings);
router.get('/bookings/custodian', authenticateToken, authorize('CUSTODIAN'), getCustodianBookings);

// Student creates booking
router.post('/bookings', authenticateToken, authorize('STUDENT'), createBooking);

// Admin sees all
router.get('/bookings', authenticateToken, authorize('ADMIN'), getAllBookings);

// Booking details (any authenticated user, controller checks ownership)
router.get('/bookings/:id', authenticateToken, getBookingById);

// Custodian actions
router.put('/bookings/:id/approve', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), approveBooking);
router.put('/bookings/:id/decline', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), declineBooking);

// Student cancels
router.put('/bookings/:id/cancel', authenticateToken, authorize('STUDENT'), cancelBooking);

module.exports = router;
