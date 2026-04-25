// routes/registrationRoutes.js
const express = require("express");
const router  = express.Router();
const {
  registerForEvent,
  getAllRegistrations,
  approveRegistration,
  rejectRegistration,
} = require("../controllers/registrationController");

router.post("/",                    registerForEvent);
router.get("/",                     getAllRegistrations);
router.patch("/:id/approve",        approveRegistration);
router.patch("/:id/reject",         rejectRegistration);

module.exports = router;
