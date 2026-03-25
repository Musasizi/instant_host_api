/**
 * controllers/bookingController.js – Booking Management Controller
 *
 * Booking Flow:
 *   1. Student creates booking → PENDING
 *   2. Custodian approves → APPROVED
 *   3. Student pays → handled by paymentController
 *   4. Custodian declines → DECLINED
 *   5. Student/Custodian cancels → CANCELLED
 *
 * Endpoints:
 *   POST   /api/bookings              → create booking (STUDENT)
 *   GET    /api/bookings/my           → student's bookings
 *   GET    /api/bookings/custodian    → custodian's received bookings
 *   GET    /api/bookings/:id          → booking details
 *   PUT    /api/bookings/:id/approve  → approve booking (CUSTODIAN)
 *   PUT    /api/bookings/:id/decline  → decline booking (CUSTODIAN)
 *   PUT    /api/bookings/:id/cancel   → cancel booking (STUDENT)
 *   GET    /api/bookings              → all bookings (ADMIN)
 */

const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');

/**
 * POST /api/bookings – Create a booking (STUDENT)
 * Body: { room_id, check_in_date, check_out_date }
 */
const createBooking = async (req, res) => {
    const { room_id, check_in_date, check_out_date } = req.body;

    if (!room_id || !check_in_date || !check_out_date) {
        return res.status(400).json({ error: 'room_id, check_in_date, and check_out_date are required.' });
    }

    try {
        // Verify room exists and is available
        const [rooms] = await Room.getById(room_id);
        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Room not found.' });
        }
        if (!rooms[0].is_available) {
            return res.status(400).json({ error: 'Room is not available.' });
        }

        // Check for overlapping bookings
        const [[{ count }]] = await Booking.checkOverlap(room_id, check_in_date, check_out_date);
        if (count > 0) {
            return res.status(409).json({ error: 'Room is already booked for the selected dates.' });
        }

        const [result] = await Booking.create({
            student_id: req.user.id,
            room_id,
            check_in_date,
            check_out_date,
        });

        res.status(201).json({
            message: 'Booking request submitted successfully.',
            bookingId: result.insertId,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/bookings/my – Student's bookings
 */
const getMyBookings = async (req, res) => {
    try {
        const [bookings] = await Booking.getByStudent(req.user.id);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/bookings/custodian – Custodian's received bookings
 * Query: ?status=PENDING|APPROVED|DECLINED|CANCELLED
 */
const getCustodianBookings = async (req, res) => {
    try {
        const [bookings] = await Booking.getByCustodian(req.user.id, req.query.status || null);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/bookings/:id – Booking details
 */
const getBookingById = async (req, res) => {
    try {
        const [results] = await Booking.getById(req.params.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = results[0];

        // Only allow access to booking owner, hostel owner, or admin
        if (
            booking.student_id !== req.user.id &&
            booking.custodian_id !== req.user.id &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/bookings/:id/approve – Approve a booking (CUSTODIAN)
 */
const approveBooking = async (req, res) => {
    try {
        const [results] = await Booking.getById(req.params.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = results[0];
        if (booking.custodian_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You can only manage bookings for your own hostels.' });
        }
        if (booking.status !== 'PENDING') {
            return res.status(400).json({ error: `Cannot approve a booking with status: ${booking.status}.` });
        }

        await Booking.updateStatus(req.params.id, 'APPROVED');
        res.json({ message: 'Booking approved successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/bookings/:id/decline – Decline a booking (CUSTODIAN)
 */
const declineBooking = async (req, res) => {
    try {
        const [results] = await Booking.getById(req.params.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = results[0];
        if (booking.custodian_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You can only manage bookings for your own hostels.' });
        }
        if (booking.status !== 'PENDING') {
            return res.status(400).json({ error: `Cannot decline a booking with status: ${booking.status}.` });
        }

        await Booking.updateStatus(req.params.id, 'DECLINED');
        res.json({ message: 'Booking declined.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/bookings/:id/cancel – Cancel a booking (STUDENT)
 */
const cancelBooking = async (req, res) => {
    try {
        const [results] = await Booking.getById(req.params.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = results[0];
        if (booking.student_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only cancel your own bookings.' });
        }
        if (!['PENDING', 'APPROVED'].includes(booking.status)) {
            return res.status(400).json({ error: `Cannot cancel a booking with status: ${booking.status}.` });
        }

        await Booking.updateStatus(req.params.id, 'CANCELLED');
        res.json({ message: 'Booking cancelled successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/bookings – All bookings (ADMIN)
 */
const getAllBookings = async (req, res) => {
    try {
        const [bookings] = await Booking.getAll();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createBooking, getMyBookings, getCustodianBookings,
    getBookingById, approveBooking, declineBooking, cancelBooking, getAllBookings,
};
