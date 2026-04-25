// controllers/dashboardController.js - Analytics and summary data

const db = require("../config/db");

// GET /api/dashboard - Returns all key metrics for the admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Total events
    const [[{ totalEvents }]] = await db.query(
      "SELECT COUNT(*) AS totalEvents FROM events"
    );

    // Total registrations
    const [[{ totalRegistrations }]] = await db.query(
      "SELECT COUNT(*) AS totalRegistrations FROM registrations"
    );

    // Approved registrations
    const [[{ approvedCount }]] = await db.query(
      "SELECT COUNT(*) AS approvedCount FROM registrations WHERE status = 'Approved'"
    );

    // Pending registrations
    const [[{ pendingCount }]] = await db.query(
      "SELECT COUNT(*) AS pendingCount FROM registrations WHERE status = 'Pending'"
    );

    // Rejected registrations
    const [[{ rejectedCount }]] = await db.query(
      "SELECT COUNT(*) AS rejectedCount FROM registrations WHERE status = 'Rejected'"
    );

    // Total attendance (checked-in)
    const [[{ totalAttendance }]] = await db.query(
      "SELECT COUNT(*) AS totalAttendance FROM attendance"
    );

    // Attendance percentage per event
    const [eventAttendance] = await db.query(`
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.category,
        e.total_seats,
        COUNT(DISTINCT r.id)                               AS approved_count,
        COUNT(DISTINCT a.id)                               AS attended_count,
        ROUND(
          IFNULL(COUNT(DISTINCT a.id) / NULLIF(COUNT(DISTINCT r.id), 0) * 100, 0),
          1
        )                                                  AS attendance_percentage
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'Approved'
      LEFT JOIN attendance     a ON r.id = a.registration_id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);

    // Recent registrations (last 5)
    const [recentRegistrations] = await db.query(`
      SELECT r.id, r.status, r.registered_at,
             u.full_name, u.email,
             e.title AS event_title
      FROM registrations r
      JOIN users u  ON r.user_id  = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          totalRegistrations,
          approvedCount,
          pendingCount,
          rejectedCount,
          totalAttendance,
          overallAttendancePercentage: approvedCount > 0
            ? Math.round((totalAttendance / approvedCount) * 100)
            : 0,
        },
        eventAttendance,
        recentRegistrations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load dashboard.", error: err.message });
  }
};

module.exports = { getDashboardStats };
