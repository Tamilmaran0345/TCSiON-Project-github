// middleware/validate.js - Input validation helpers

const validateEvent = (data) => {
  const errors = [];
  const { title, description, event_date, event_time, venue, category, total_seats } = data;

  if (!title || title.trim().length < 5)
    errors.push("Event title must be at least 5 characters.");
  if (!description || description.trim().length < 20)
    errors.push("Description must be at least 20 characters.");
  if (!event_date)
    errors.push("Event date is required.");
  else if (new Date(event_date) < new Date().setHours(0, 0, 0, 0))
    errors.push("Event date cannot be in the past.");
  if (!event_time)
    errors.push("Event time is required.");
  if (!venue || venue.trim().length < 3)
    errors.push("Venue must be at least 3 characters.");
  if (!["Conference", "Workshop", "Webinar", "Seminar"].includes(category))
    errors.push("Category must be Conference, Workshop, Webinar, or Seminar.");
  if (!total_seats || isNaN(total_seats) || total_seats < 1 || total_seats > 10000)
    errors.push("Total seats must be a number between 1 and 10000.");

  return errors;
};

const validateUser = (data) => {
  const errors = [];
  const { full_name, email, phone } = data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;

  if (!full_name || full_name.trim().length < 2)
    errors.push("Full name must be at least 2 characters.");
  if (!email || !emailRegex.test(email))
    errors.push("A valid email address is required.");
  if (!phone || !phoneRegex.test(phone.replace(/[\s\-\+]/g, "")))
    errors.push("Phone number must be 7–15 digits.");

  return errors;
};

module.exports = { validateEvent, validateUser };
