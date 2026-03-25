/**
 * models/reviewModel.js – Data Access Layer for Reviews
 *
 * Rules: One review per completed booking. Rating 1–5.
 */

const db = require('../config/db');

const Review = {
    /**
     * Create a new review.
     */
    create: ({ student_id, hostel_id, booking_id, rating, comment }) => {
        const sql = `INSERT INTO reviews
      (student_id, hostel_id, booking_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)`;
        return db.query(sql, [student_id, hostel_id, booking_id, rating, comment || '']);
    },

    /**
     * Get all reviews for a hostel.
     */
    getByHostel: (hostel_id) => {
        const sql = `SELECT r.*, u.full_name AS student_name
                 FROM reviews r
                 JOIN users u ON r.student_id = u.id
                 WHERE r.hostel_id = ?
                 ORDER BY r.created_at DESC`;
        return db.query(sql, [hostel_id]);
    },

    /**
     * Get reviews by student.
     */
    getByStudent: (student_id) => {
        const sql = `SELECT r.*, h.name AS hostel_name
                 FROM reviews r
                 JOIN hostels h ON r.hostel_id = h.id
                 WHERE r.student_id = ?
                 ORDER BY r.created_at DESC`;
        return db.query(sql, [student_id]);
    },

    /**
     * Check if a review already exists for a booking.
     */
    existsForBooking: async (booking_id) => {
        const [[{ count }]] = await db.query(
            'SELECT COUNT(*) AS count FROM reviews WHERE booking_id = ?',
            [booking_id]
        );
        return count > 0;
    },

    /**
     * Get a review by ID.
     */
    getById: (id) => {
        const sql = 'SELECT * FROM reviews WHERE id = ?';
        return db.query(sql, [id]);
    },

    /**
     * Delete a review.
     */
    delete: (id) => {
        const sql = 'DELETE FROM reviews WHERE id = ?';
        return db.query(sql, [id]);
    },
};

module.exports = Review;
