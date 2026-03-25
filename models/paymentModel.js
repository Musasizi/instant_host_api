/**
 * models/paymentModel.js – Data Access Layer for Payments
 *
 * Payment status: PENDING → COMPLETED | FAILED
 */

const db = require('../config/db');

const Payment = {
    /**
     * Create a new payment record.
     */
    create: ({ booking_id, student_id, amount, method, transaction_ref }) => {
        const sql = `INSERT INTO payments
      (booking_id, student_id, amount, method, status, transaction_ref)
      VALUES (?, ?, ?, ?, 'PENDING', ?)`;
        return db.query(sql, [booking_id, student_id, amount, method || 'MOBILE_MONEY', transaction_ref]);
    },

    /**
     * Get payment by ID.
     */
    getById: (id) => {
        const sql = `SELECT p.*, b.room_id, b.check_in_date, b.check_out_date,
                        u.full_name AS student_name, h.name AS hostel_name
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 JOIN users u ON p.student_id = u.id
                 JOIN rooms r ON b.room_id = r.id
                 JOIN hostels h ON r.hostel_id = h.id
                 WHERE p.id = ?`;
        return db.query(sql, [id]);
    },

    /**
     * Get payment by booking ID.
     */
    getByBooking: (booking_id) => {
        const sql = 'SELECT * FROM payments WHERE booking_id = ?';
        return db.query(sql, [booking_id]);
    },

    /**
     * Get all payments for a student.
     */
    getByStudent: (student_id) => {
        const sql = `SELECT p.*, h.name AS hostel_name, r.room_type
                 FROM payments p
                 JOIN bookings b ON p.booking_id = b.id
                 JOIN rooms r ON b.room_id = r.id
                 JOIN hostels h ON r.hostel_id = h.id
                 WHERE p.student_id = ?
                 ORDER BY p.created_at DESC`;
        return db.query(sql, [student_id]);
    },

    /**
     * Update payment status.
     */
    updateStatus: (id, status) => {
        const sql = 'UPDATE payments SET status = ? WHERE id = ?';
        return db.query(sql, [status, id]);
    },

    /**
     * Get all payments (admin view).
     */
    getAll: () => {
        const sql = `SELECT p.*, u.full_name AS student_name, h.name AS hostel_name
                 FROM payments p
                 JOIN users u ON p.student_id = u.id
                 JOIN bookings b ON p.booking_id = b.id
                 JOIN rooms r ON b.room_id = r.id
                 JOIN hostels h ON r.hostel_id = h.id
                 ORDER BY p.created_at DESC`;
        return db.query(sql);
    },
};

module.exports = Payment;
