/**
 * routes/roomRoutes.js – Room Management Routes
 *
 * Public:
 *   GET /api/hostels/:hostelId/rooms  → rooms in a hostel
 *   GET /api/rooms/:id                → room details
 *
 * Protected (CUSTODIAN):
 *   POST   /api/hostels/:hostelId/rooms  → add room
 *   PUT    /api/rooms/:id                → update room
 *   DELETE /api/rooms/:id                → delete room
 */

const express = require('express');
const {
    getRoomsByHostel, getRoomById, createRoom, updateRoom, deleteRoom,
} = require('../controllers/roomController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/hostels/:hostelId/rooms', getRoomsByHostel);
router.get('/rooms/:id', getRoomById);

// Protected (CUSTODIAN)
router.post('/hostels/:hostelId/rooms', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), createRoom);
router.put('/rooms/:id', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), updateRoom);
router.delete('/rooms/:id', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), deleteRoom);

module.exports = router;
