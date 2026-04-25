// routes/attendanceRoutes.js
const express = require("express");
const router  = express.Router();
const { checkIn, getAttendance } = require("../controllers/attendanceController");

router.post("/checkin", checkIn);
router.get("/",         getAttendance);

module.exports = router;
