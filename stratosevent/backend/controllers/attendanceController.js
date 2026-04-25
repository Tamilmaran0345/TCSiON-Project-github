// controllers/attendanceController.js - Check-in and attendance tracking

const db = require("../config/db");

// POST /api/attendance/checkin - Mark attendance for an approved registrant
const checkIn = async (req, res) => {
  const { registration_id } = req.body;
  if (!registration_id)
    return res.status(400).json({ success: false, message: "registration_id is required." });

  try {
    // Only approved registrations can check in
    const [[reg]] = await db.query(
      `SELECT r.id, r.status, u.full_name, e.title
       FROM registrations r
       JOIN users u  ON r.user_id  = u.id
       JOIN events e ON r.event_id = e.id
       WHERE r.id = ?`,
      [registration_id]
    );

    if (!reg)
      return res.status(404).json({ success: false, message: "Registration not found." });
    if (reg.status !== "Approved")
      return res.status(400).json({ success: false, message: "Only approved registrants can check in." });

    // Prevent duplicate check-in
    const [[existing]] = await db.query(
      "SELECT id FROM attendance WHERE registration_id = ?",
      [registration_id]
    );
    if (existing)
      return res.status(409).json({ success: false, message: `${reg.full_name} is already checked in.` });

    await db.query(
      "INSERT INTO attendance (registration_id) VALUES (?)",
      [registration_id]
    );

    res.status(201).json({
      success: true,
      message: `Check-in successful for ${reg.full_name} — ${reg.title}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Check-in failed.", error: err.message });
  }
};

// GET /api/attendance - Get all attendance records (Admin)
const getAttendance = async (req, res) => {
  try {
    const { event_id } = req.query;
    let query = `
      SELECT a.id, a.checked_in_at,
             u.full_name, u.email, u.department,
             e.title AS event_title, e.event_date, e.category,
             r.id AS registration_id
      FROM attendance a
      JOIN registrations r ON a.registration_id = r.id
      JOIN users u         ON r.user_id  = u.id
      JOIN events e        ON r.event_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (event_id) { query += " AND r.event_id = ?"; params.push(event_id); }
    query += " ORDER BY a.checked_in_at DESC";

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch attendance.", error: err.message });
  }
};

module.exports = { checkIn, getAttendance };
