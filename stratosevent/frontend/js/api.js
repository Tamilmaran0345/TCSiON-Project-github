// js/api.js — Central fetch wrapper for all API calls
const API_BASE = "http://localhost:5000/api";

const api = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  async post(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.join(" ") || data.message || "Request failed");
    return data;
  },

  async put(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.join(" ") || data.message || "Request failed");
    return data;
  },

  async patch(endpoint, body = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },
};

// ── UI Helpers ────────────────────────────────────────────────
function showAlert(container, type, message) {
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  const el = document.getElementById(container);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${icons[type] || ""} ${message}</div>`;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => { if (el) el.innerHTML = ""; }, 5500);
}

function setLoading(btnId, loading, text = "Save") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="loader"></span> Processing...`
    : text;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const d = new Date(); d.setHours(+h, +m);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function seatBadge(available, total) {
  const pct = (available / total) * 100;
  if (available === 0) return `<span class="seat-pill full">⊗ Full</span>`;
  if (pct <= 20)       return `<span class="seat-pill limited">◉ ${available} left</span>`;
  return `<span class="seat-pill available">◎ ${available} seats</span>`;
}

function statusBadge(status) {
  const map = {
    Pending:   "badge-amber",
    Approved:  "badge-green",
    Rejected:  "badge-red",
    Active:    "badge-teal",
    Cancelled: "badge-red",
    Completed: "badge-neutral",
  };
  return `<span class="badge ${map[status] || 'badge-neutral'}">${status}</span>`;
}

function categoryBadge(cat) {
  const icons = { Conference: "⬡", Workshop: "◈", Webinar: "◉", Seminar: "◇" };
  return `<span class="badge badge-neutral">${icons[cat] || "◦"} ${cat}</span>`;
}
