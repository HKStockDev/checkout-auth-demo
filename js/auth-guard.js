import API from "./auth-api.js";

const AUTH_ENTRY_PAGES = new Set(["login.html", "register.html"]);
const PUBLIC_AUTH_PAGES = new Set([
  ...AUTH_ENTRY_PAGES,
  "reset-password.html",
]);

function currentPage() {
  const part = window.location.pathname.split("/").pop();
  if (!part || !part.includes(".")) return "index.html";
  return part;
}

function loginUrl(next) {
  const target = next || `${currentPage()}${window.location.search}`;
  return `login.html?next=${encodeURIComponent(target)}`;
}

async function initAuthGuard() {
  const page = currentPage();

  if (PUBLIC_AUTH_PAGES.has(page)) {
    try {
      const { ok, data } = await API.me();
      if (ok && AUTH_ENTRY_PAGES.has(page)) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        window.location.replace(
          next && next.endsWith(".html") && !next.includes("://") ? next : "index.html"
        );
        return { user: data.user, public: true, redirecting: true };
      }
      if (ok) return { user: data.user, public: true, redirecting: false };
    } catch {
      /* stay on auth page */
    }
    return { user: null, public: true, redirecting: false };
  }

  try {
    const { ok, data } = await API.me();
    if (!ok) {
      window.location.replace(loginUrl());
      return { user: null, public: false, redirecting: true };
    }
    return { user: data.user, public: false, redirecting: false };
  } catch {
    window.location.replace(loginUrl());
    return { user: null, public: false, redirecting: true };
  }
}

export const authReady = initAuthGuard();

export function isPublicAuthPage() {
  return PUBLIC_AUTH_PAGES.has(currentPage());
}
