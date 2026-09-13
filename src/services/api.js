const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "VITE_API_URL is not defined. Please check your .env configuration.",
  );
}

const ADMIN_TOKEN_KEY = "gymssy_admin_token";
const ADMIN_USER_KEY = "gymssy_admin_user";

const PROVIDER_TOKEN_KEY = "gymssy_provider_token";
const PROVIDER_USER_KEY = "gymssy_provider_user";

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  getUser() {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};

/**
 * Centralized localStorage helpers for PROVIDER auth persistence.
 * Uses completely separate keys — never overwrites admin auth data.
 */
export const providerTokenStorage = {
  getToken() {
    return localStorage.getItem(PROVIDER_TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(PROVIDER_TOKEN_KEY, token);
  },
  getUser() {
    const raw = localStorage.getItem(PROVIDER_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(PROVIDER_USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(PROVIDER_TOKEN_KEY);
    localStorage.removeItem(PROVIDER_USER_KEY);
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

export async function apiRequest(endpoint, options = {}, auth = false) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  let authToken = null;
  if (auth === true) {
    // Legacy path — preserves exact existing admin behavior.
    authToken = tokenStorage.getToken();
  } else if (typeof auth === "string" && auth.length > 0) {
    authToken = auth;
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new ApiError("Unable to connect to the server. Please try again.", 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
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
