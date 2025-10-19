/**
 * BookHive API Client
 * -------------------
 * Provides a simple authenticated fetch wrapper for the backend API.
 * Auto-includes JWT token from localStorage, parses errors, and throws
 * descriptive exceptions on failure.
 */

const BASE =
  import.meta.env.VITE_API ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

/**
 * Core API request function
 * @param {string} path - Endpoint path, e.g. '/books' or '/cart'
 * @param {object} opts - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function api(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  // Attempt to parse JSON response, even for errors
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Auth: Login existing user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} {token, user}
 */
export async function login(email, password) {
  const r = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (r.token) localStorage.setItem("token", r.token);
  return r;
}

/**
 * Auth: Register new user
 * @param {object} payload - {full_name, email, password, ...}
 */
export async function register(payload) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Auth: Logout
 */
export function logout() {
  localStorage.removeItem("token");
}

/**
 * Convenience helpers
 */
export const get = (path) => api(path);
export const post = (path, body) =>
  api(path, { method: "POST", body: JSON.stringify(body) });
export const put = (path, body) =>
  api(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path) => api(path, { method: "DELETE" });
