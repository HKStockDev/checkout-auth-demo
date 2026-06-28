const TOKEN_KEY = "auth_token";

const API = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },

  authHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async request(path, options = {}) {
    const res = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders(),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  me() {
    return this.request("/api/auth/me");
  },

  async login(email, password) {
    const result = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result.ok && result.data.token) this.setToken(result.data.token);
    return result;
  },

  async register(name, email, password) {
    const result = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (result.ok && result.data.token) this.setToken(result.data.token);
    return result;
  },

  async logout() {
    const result = await this.request("/api/auth/logout", { method: "POST" });
    this.setToken(null);
    return result;
  },

  requestPasswordReset(email) {
    return this.request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  confirmPasswordReset(token, password) {
    return this.request("/api/auth/reset-password", {
      method: "PUT",
      body: JSON.stringify({ token, password }),
    });
  },
};

export default API;

export function showAlert(el, message, type = "error") {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden", "alert-error", "alert-success");
  el.classList.add(type === "success" ? "alert-success" : "alert-error");
}

export function hideAlert(el) {
  if (!el) return;
  el.classList.add("hidden");
  el.textContent = "";
}

export function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  if (next && next.endsWith(".html") && !next.includes("://")) return next;
  return "index.html";
}

async function syncTokenFromSession() {
  if (API.getToken()) return;
  try {
    const { ok, data } = await API.me();
    if (ok && data.token) API.setToken(data.token);
  } catch {
    /* ignore */
  }
}

document.addEventListener("DOMContentLoaded", syncTokenFromSession);
