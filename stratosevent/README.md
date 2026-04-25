# ⬡ StratosEvent — Event Management & Registration Platform

A full-stack enterprise web application for managing events, registrations, approval workflows, and attendance tracking.

**Stack:** Node.js · Express · MySQL · HTML · CSS · Vanilla JavaScript

---

## 📁 Project Structure

```
stratosevent/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── eventController.js     # Event CRUD logic
│   │   ├── registrationController.js  # Registration + approval logic
│   │   ├── attendanceController.js    # Check-in tracking
│   │   └── dashboardController.js     # Analytics & stats
│   ├── middleware/
│   │   └── validate.js            # Input validation helpers
│   ├── routes/
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── database/
│   └── schema.sql                 # Full DB schema + seed data
│
└── frontend/
    ├── css/
    │   └── style.css              # Global styles (CSS variables, components)
    ├── js/
    │   └── api.js                 # Fetch wrapper + UI utilities
    ├── pages/
    │   ├── register.html          # User registration page
    │   ├── admin-dashboard.html   # Admin analytics + event management
    │   └── admin-approval.html    # Registration approval panel
    └── index.html                 # Public event listing page
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) v8.0 or higher
- npm (comes with Node.js)

---

## 🚀 Setup Instructions

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/stratosevent.git
cd stratosevent
```

### Step 2 — Set Up the Database

1. Open MySQL Workbench or your MySQL terminal.
2. Run the schema file to create the database, tables, and seed data:

```sql
source /path/to/stratosevent/database/schema.sql;
```

Or via the terminal:

```bash
mysql -u root -p < database/schema.sql
```

### Step 3 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and update your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=stratosevent
PORT=5000
```

### Step 4 — Install Dependencies & Start the Server

```bash
cd backend
npm install
npm start          # production
# OR
npm run dev        # development (auto-restarts with nodemon)
```

You should see:
```
✅ MySQL connected successfully
🚀 StratosEvent server running at http://localhost:5000
```

### Step 5 — Open the Frontend

The backend serves the frontend as static files. Just open your browser:

```
http://localhost:5000
```

Or open the HTML files directly in your browser from the `frontend/` folder.

---

## 🗺️ Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| Event Listing | `/` | Browse all events, filter by category/status, register via modal |
| Registration | `/pages/register.html` | Dedicated registration form with event preview |
| Admin Dashboard | `/pages/admin-dashboard.html` | Stats, event CRUD, attendance analytics, check-in |
| Approval Panel | `/pages/admin-approval.html` | Review, approve, or reject pending registrations |

---

## 🔌 API Reference

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations` | Register a user for an event |
| GET | `/api/registrations` | Get all registrations (supports `?status=` and `?event_id=` filters) |
| PATCH | `/api/registrations/:id/approve` | Approve a registration |
| PATCH | `/api/registrations/:id/reject` | Reject a registration (restores seat) |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/checkin` | Mark attendance (requires `registration_id`) |
| GET | `/api/attendance` | Get all attendance records (supports `?event_id=`) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get full analytics summary |

---

## 🛡️ Key Business Rules

- **Seat Control** — A transaction lock prevents two users from booking the last seat simultaneously (uses `FOR UPDATE` row lock + `BEGIN/COMMIT`).
- **Approval Workflow** — All registrations start as `Pending`. Admin must explicitly Approve or Reject.
- **Seat Restoration** — Rejecting a `Pending` registration automatically restores the seat to the event.
- **Duplicate Prevention** — A user cannot register for the same event twice (unique constraint on `user_id + event_id`).
- **Check-In Guard** — Only `Approved` registrations can check in, and each can only check in once.
- **Validation** — Both frontend (real-time) and backend (controller-level) validation are enforced.

---

## 📊 Database Schema

```
users           id, full_name, email (UNIQUE), phone, department
events          id, title, description, event_date, event_time, venue,
                category, total_seats, available_seats, status
registrations   id, user_id (FK), event_id (FK), status, registered_at,
                reviewed_at, notes  [UNIQUE: user_id + event_id]
attendance      id, registration_id (FK UNIQUE), checked_in_at
```

---

## 🔧 Development Tips

- Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to test API endpoints.
- Run `npm run dev` for hot-reload during development.
- The `api.js` frontend file has one `API_BASE` constant — change `localhost:5000` to your deployed URL for production.

---

## 📦 Deployment (GitHub Submission)

```bash
git init
git add .
git commit -m "feat: initial StratosEvent full-stack implementation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stratosevent.git
git push -u origin main
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## .gitignore

```
backend/node_modules/
backend/.env
```

---

## 👤 Author

Built as an industry project demonstrating full-stack Node.js + MySQL + Vanilla JS development with enterprise-grade patterns: transactional seat management, multi-step approval workflows, and normalized relational database design.
