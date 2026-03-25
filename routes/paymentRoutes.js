/**
 * routes/paymentRoutes.js – Payment Routes
 *
 * Protected (STUDENT):
 *   POST /api/payments     → make payment
 *   GET  /api/payments/my  → student's payments
 *
 * Protected (any):
 *   GET  /api/payments/:id → payment details
 *
 * Protected (ADMIN):
 *   GET  /api/payments     → all payments
 */

const express = require('express');
const {
    makePayment, getMyPayments, getPaymentById, getAllPayments,
} = require('../controllers/paymentController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Static routes before :id
router.get('/payments/my', authenticateToken, authorize('STUDENT'), getMyPayments);

// Student pays
router.post('/payments', authenticateToken, authorize('STUDENT'), makePayment);

// Admin sees all
router.get('/payments', authenticateToken, authorize('ADMIN'), getAllPayments);

// Payment details (controller checks ownership)
router.get('/payments/:id', authenticateToken, getPaymentById);

module.exports = router;
