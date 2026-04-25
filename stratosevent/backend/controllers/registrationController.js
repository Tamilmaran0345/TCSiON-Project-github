// controllers/registrationController.js - Registration & approval logic

const db = require("../config/db");
const { validateUser } = require("../middleware/validate");

// POST /api/registrations - Register a user for an event
const registerForEvent = async (req, res) => {
  const userErrors = validateUser(req.body);
  if (userErrors.length)
    return res.status(400).json({ success: false, errors: userErrors });

  const { full_name, email, phone, department, event_id } = req.body;
  if (!event_id)
    return res.status(400).json({ success: false, message: "event_id is required." });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check event exists and has seats
    const [[event]] = await conn.query(
      "SELECT id, available_seats, status FROM events WHERE id = ? FOR UPDATE",
      [event_id]
    );
    if (!event)
      throw { status: 404, message: "Event not found." };
    if (event.status !== "Active")
      throw { status: 400, message: "This event is no longer accepting registrations." };
    if (event.available_seats < 1)
      throw { status: 409, message: "Sorry, this event is fully booked." };

    // Upsert user by email
    let userId;
    const [[existing]] = await conn.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      userId = existing.id;
    } else {
      const [ins] = await conn.query(
        "INSERT INTO users (full_name, email, phone, department) VALUES (?, ?, ?, ?)",
        [full_name.trim(), email.toLowerCase(), phone.trim(), department?.trim() || null]
      );
      userId = ins.insertId;
    }

    // Check for duplicate registration
    const [[dup]] = await conn.query(
      "SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ?",
      [userId, event_id]
    );
    if (dup)
      throw { status: 409, message: `You are already registered for this event (Status: ${dup.status}).` };

    // Create registration
    await conn.query(
      "INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, 'Pending')",
      [userId, event_id]
    );

    // Decrement available seats
    await conn.query(
      "UPDATE events SET available_seats = available_seats - 1 WHERE id = ?",
      [event_id]
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      message: "Registration submitted! Your request is pending admin approval.",
    });
  } catch (err) {
    await conn.rollback();
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || "Registration failed." });
  } finally {
    conn.release();
  }
};

// GET /api/registrations - Get all registrations (Admin)
const getAllRegistrations = async (req, res) => {
  try {
    const { status, event_id } = req.query;
    let query = `
      SELECT r.id, r.status, r.registered_at, r.reviewed_at, r.notes,
             u.full_name, u.email, u.phone, u.department,
             e.title AS event_title, e.event_date, e.category
      FROM registrations r
      JOIN users u  ON r.user_id  = u.id
      JOIN events e ON r.event_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (status)   { query += " AND r.status = ?";   params.push(status); }
    if (event_id) { query += " AND r.event_id = ?"; params.push(event_id); }
    query += " ORDER BY r.registered_at DESC";

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch registrations.", error: err.message });
  }
};

// PATCH /api/registrations/:id/approve - Admin approves a registration
const approveRegistration = async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE registrations SET status='Approved', reviewed_at=NOW(), notes=?
       WHERE id = ? AND status='Pending'`,
      [req.body.notes || null, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ success: false, message: "Registration not found or already reviewed." });
    res.json({ success: true, message: "Registration approved." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approval failed.", error: err.message });
  }
};

// PATCH /api/registrations/:id/reject - Admin rejects a registration
const rejectRegistration = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[reg]] = await conn.query(
      "SELECT event_id FROM registrations WHERE id = ? AND status='Pending'",
      [req.params.id]
    );
    if (!reg) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Registration not found or already reviewed." });
    }

    await conn.query(
      `UPDATE registrations SET status='Rejected', reviewed_at=NOW(), notes=?
       WHERE id = ?`,
      [req.body.notes || null, req.params.id]
    );

    // Restore the seat
    await conn.query(
      "UPDATE events SET available_seats = available_seats + 1 WHERE id = ?",
      [reg.event_id]
    );

    await conn.commit();
    res.json({ success: true, message: "Registration rejected and seat restored." });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: "Rejection failed.", error: err.message });
  } finally {
    conn.release();
  }
};

module.exports = { registerForEvent, getAllRegistrations, approveRegistration, rejectRegistration };
