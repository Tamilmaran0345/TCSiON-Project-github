// controllers/eventController.js - All event-related business logic

const db = require("../config/db");
const { validateEvent } = require("../middleware/validate");

// GET /api/events - List all active events
const getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, description, event_date, event_time,
              venue, category, total_seats, available_seats, status, created_at
       FROM events
       ORDER BY event_date ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch events.", error: err.message });
  }
};

// GET /api/events/:id - Get a single event
const getEventById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Event not found." });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch event.", error: err.message });
  }
};

// POST /api/events - Create a new event (Admin)
const createEvent = async (req, res) => {
  const errors = validateEvent(req.body);
  if (errors.length)
    return res.status(400).json({ success: false, errors });

  const { title, description, event_date, event_time, venue, category, total_seats } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO events (title, description, event_date, event_time, venue, category, total_seats, available_seats)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description.trim(), event_date, event_time, venue.trim(), category, total_seats, total_seats]
    );
    res.status(201).json({ success: true, message: "Event created successfully.", eventId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create event.", error: err.message });
  }
};

// PUT /api/events/:id - Update an event (Admin)
const updateEvent = async (req, res) => {
  const errors = validateEvent(req.body);
  if (errors.length)
    return res.status(400).json({ success: false, errors });

  const { title, description, event_date, event_time, venue, category, total_seats, status } = req.body;
  try {
    // Recalculate available seats proportionally
    const [existing] = await db.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Event not found." });

    const usedSeats     = existing[0].total_seats - existing[0].available_seats;
    const newAvailable  = Math.max(0, total_seats - usedSeats);

    await db.query(
      `UPDATE events SET title=?, description=?, event_date=?, event_time=?, venue=?,
              category=?, total_seats=?, available_seats=?, status=?
       WHERE id = ?`,
      [title.trim(), description.trim(), event_date, event_time, venue.trim(),
       category, total_seats, newAvailable, status || "Active", req.params.id]
    );
    res.json({ success: true, message: "Event updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update event.", error: err.message });
  }
};

// DELETE /api/events/:id - Delete an event (Admin)
const deleteEvent = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: "Event not found." });
    res.json({ success: true, message: "Event deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete event.", error: err.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
