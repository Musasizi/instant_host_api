/**
 * routes/reviewRoutes.js – Review Routes
 *
 * Public:
 *   GET /api/hostels/:hostelId/reviews  → hostel reviews
 *
 * Protected (STUDENT):
 *   POST /api/reviews     → create review
 *   GET  /api/reviews/my  → student's reviews
 */

const express = require('express');
const { createReview, getHostelReviews, getMyReviews } = require('../controllers/reviewController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/hostels/:hostelId/reviews', getHostelReviews);

// Protected (STUDENT)
router.post('/reviews', authenticateToken, authorize('STUDENT'), createReview);
router.get('/reviews/my', authenticateToken, authorize('STUDENT'), getMyReviews);

module.exports = router;
