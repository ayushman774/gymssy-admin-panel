// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Fail loudly in dev if env is misconfigured — but never log secrets.
  console.error(
    "VITE_API_URL is not defined. Please check your .env configuration.",
  );
}

const TOKEN_KEY = "gymssy_admin_token";
const USER_KEY = "gymssy_admin_user";

/**
 * Centralized localStorage helpers for auth persistence.
 * No component should touch localStorage directly.
 */
export const tokenStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

/**
 * A friendly, user-facing error class.
 * UI components can safely display `error.message`.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getFriendlyMessage(status, backendMessage) {
  if (backendMessage) return backendMessage;

  switch (status) {
    case 400:
      return "Invalid or missing information. Please check your input.";
    case 401:
      return "Invalid email or password.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "An account with this email already exists.";
    case 500:
      return "Something went wrong on our end. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Core request helper.
 * @param {string} endpoint - e.g. "/api/auth/login"
 * @param {object} options - fetch options
 * @param {boolean} withAuth - attach Authorization header if token exists
 */
export async function apiRequest(endpoint, options = {}, withAuth = false) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (withAuth) {
    const token = tokenStorage.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // Backend unreachable, DNS failure, CORS, etc.
    throw new ApiError("Unable to connect to the server. Please try again.", 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON or empty response body.
    payload = null;
  }

  if (!response.ok) {
    const backendMessage =
      payload && typeof payload.message === "string" ? payload.message : null;
    throw new ApiError(
      getFriendlyMessage(response.status, backendMessage),
      response.status,
    );
  }

  return payload;
}
