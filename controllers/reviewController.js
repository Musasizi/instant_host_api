/**
 * controllers/reviewController.js – Review Controller
 *
 * Rules:
 *   - Only one review per completed booking
 *   - Rating must be 1–5
 *
 * Endpoints:
 *   POST /api/reviews                     → create review (STUDENT)
 *   GET  /api/hostels/:hostelId/reviews   → get reviews for a hostel (public)
 *   GET  /api/reviews/my                  → student's reviews
 */

const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const Hostel = require('../models/hostelModel');

/**
 * POST /api/reviews – Create a review for a completed booking
 * Body: { booking_id, rating, comment }
 */
const createReview = async (req, res) => {
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
        return res.status(400).json({ error: 'booking_id and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    try {
        // Verify the booking belongs to the student and is completed
        const [bookings] = await Booking.getById(booking_id);
        if (bookings.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = bookings[0];

        if (booking.student_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only review your own bookings.' });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'You can only review completed bookings.' });
        }

        // Check if already reviewed
        const exists = await Review.existsForBooking(booking_id);
        if (exists) {
            return res.status(409).json({ error: 'You have already reviewed this booking.' });
        }

        const [result] = await Review.create({
            student_id: req.user.id,
            hostel_id: booking.hostel_id,
            booking_id,
            rating,
            comment,
        });

        // Update hostel average rating
        await Hostel.updateRating(booking.hostel_id);

        res.status(201).json({
            message: 'Review submitted successfully.',
            reviewId: result.insertId,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/hostels/:hostelId/reviews – Get reviews for a hostel (public)
 */
const getHostelReviews = async (req, res) => {
    try {
        const [reviews] = await Review.getByHostel(req.params.hostelId);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/reviews/my – Student's reviews
 */
const getMyReviews = async (req, res) => {
    try {
        const [reviews] = await Review.getByStudent(req.user.id);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createReview, getHostelReviews, getMyReviews };
