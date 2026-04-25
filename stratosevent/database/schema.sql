-- ============================================================
-- StratosEvent - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS stratosevent;
USE stratosevent;

-- ------------------------------------------------------------
-- Table: users
-- Stores all registered users of the platform
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    phone       VARCHAR(20)         NOT NULL,
    department  VARCHAR(100)        DEFAULT NULL,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: events
-- Stores all events created by admins
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200)        NOT NULL,
    description     TEXT                NOT NULL,
    event_date      DATE                NOT NULL,
    event_time      TIME                NOT NULL,
    venue           VARCHAR(200)        NOT NULL,
    category        ENUM('Conference', 'Workshop', 'Webinar', 'Seminar') NOT NULL,
    total_seats     INT                 NOT NULL,
    available_seats INT                 NOT NULL,
    status          ENUM('Active', 'Cancelled', 'Completed') DEFAULT 'Active',
    created_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- ------------------------------------------------------------
-- Table: registrations
-- Links users to events with an approval workflow
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    event_id        INT             NOT NULL,
    status          ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    registered_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    reviewed_at     TIMESTAMP       NULL,
    notes           VARCHAR(255)    DEFAULT NULL,
    UNIQUE KEY uq_user_event (user_id, event_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table: attendance
-- Tracks check-in records for approved registrations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    registration_id     INT         NOT NULL UNIQUE,
    checked_in_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Seed Data: Sample events for demo
-- ------------------------------------------------------------
INSERT INTO events (title, description, event_date, event_time, venue, category, total_seats, available_seats) VALUES
('Cloud Computing Summit 2026',   'Explore the latest trends in cloud infrastructure, DevOps, and microservices architectures.', '2026-05-15', '09:00:00', 'Grand Convention Center, Hall A', 'Conference', 100, 100),
('React & Node.js Workshop',      'Hands-on workshop covering full-stack development with React 18 and Node.js best practices.',  '2026-05-22', '10:00:00', 'Tech Hub, Room 201',              'Workshop',   30,  30),
('AI in Enterprise Webinar',      'Live discussion on implementing AI solutions in enterprise workflows and decision systems.',    '2026-06-01', '15:00:00', 'Online (Zoom)',                    'Webinar',    200, 200),
('Agile & Scrum Masterclass',     'Deep-dive into Agile methodologies, sprint planning, and Scrum ceremonies for teams.',        '2026-06-10', '09:30:00', 'Business Park, Training Room B',   'Seminar',    50,  50),
('Cybersecurity Trends 2026',     'Annual cybersecurity conference covering threat intelligence, zero trust, and compliance.',    '2026-06-20', '08:00:00', 'Grand Convention Center, Hall B', 'Conference', 120, 120);
