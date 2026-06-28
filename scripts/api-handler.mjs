import { randomBytes } from "node:crypto";
import {
  createSession,
  deleteSession,
  findSession,
  findUserByEmail,
  findUserById,
  findUserByResetToken,
  hashPassword,
  newId,
  nowIso,
  sanitizeUser,
  upsertUser,
  verifyPassword,
} from "./auth-db.mjs";
import { readDashboardTables } from "./dashboard-db.mjs";
import { createOrder, readOrders } from "./orders-db.mjs";
import {
  getBearerToken,
  getTokenFromCookies,
  signToken,
  verifyToken,
} from "./jwt.mjs";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "./rate-limit.mjs";
import { loadEnv, projectRoot } from "./load-env.mjs";

loadEnv(projectRoot(import.meta.url));

const AUTH_TOKEN_COOKIE = "auth_token";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 7 * 24 * 60 * 60 * 1000);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function json(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(data));
}

function enforceRateLimit(req, res) {
  const result = checkRateLimit(getClientIp(req));
  if (!result.allowed) {
    json(
      res,
      429,
      { error: "Too many requests. Please try again later." },
      {
        ...rateLimitHeaders(result),
        "Retry-After": String(result.retryAfter),
      }
    );
    return false;
  }
  return true;
}

function setAuthTokenCookie(token, payload) {
  const maxAge = Math.max(0, (payload?.exp || 0) - Math.floor(Date.now() / 1000));
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${AUTH_TOKEN_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearAuthTokenCookie() {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${AUTH_TOKEN_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

async function issueAuth(user) {
  const session = await createSession(user.user_id, SESSION_TTL_MS);
  const token = signToken(user, session.session_id);
  const payload = verifyToken(token);
  return { session, token, payload };
}

async function revokeAuthToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = getBearerToken(req) || getTokenFromCookies(cookies, AUTH_TOKEN_COOKIE);
  if (!token) return;
  const payload = verifyToken(token);
  if (payload?.sid) await deleteSession(payload.sid);
}

async function getAuthUser(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = getBearerToken(req) || getTokenFromCookies(cookies, AUTH_TOKEN_COOKIE);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.sub || !payload?.sid) return null;

  const session = await findSession(payload.sid);
  if (!session || session.user_id !== payload.sub) return null;

  if (new Date(session.expires_at) < new Date()) {
    await deleteSession(payload.sid);
    return null;
  }

  const user = await findUserById(payload.sub);
  return sanitizeUser(user);
}

async function parseJson(req) {
  const body = await readBody(req);
  if (!body) return null;
  return JSON.parse(body);
}

async function handleAuth(req, res, pathname, method) {
  if (pathname === "/api/auth/register" && method === "POST") {
    try {
      const body = await parseJson(req);
      if (!body?.email || !body?.password || !body?.name) {
        json(res, 400, { error: "email, password, and name are required" });
        return true;
      }
      if (body.password.length < 8) {
        json(res, 400, { error: "Password must be at least 8 characters" });
        return true;
      }

      const existing = await findUserByEmail(body.email);
      if (existing) {
        json(res, 409, { error: "An account with this email already exists" });
        return true;
      }

      const now = nowIso();
      const user = {
        user_id: newId(),
        email: body.email.trim().toLowerCase(),
        password_hash: hashPassword(body.password),
        name: body.name.trim(),
        reset_token: "",
        reset_token_expires: "",
        created_at: now,
        updated_at: now,
      };

      await upsertUser(user);
      const { token, payload } = await issueAuth(user);
      json(
        res,
        201,
        { user: sanitizeUser(user), token },
        { "Set-Cookie": setAuthTokenCookie(token, payload) }
      );
    } catch (err) {
      json(res, 400, { error: err.message || "Invalid request" });
    }
    return true;
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    try {
      const body = await parseJson(req);
      if (!body?.email || !body?.password) {
        json(res, 400, { error: "email and password are required" });
        return true;
      }

      const user = await findUserByEmail(body.email);
      if (!user || !verifyPassword(body.password, user.password_hash)) {
        json(res, 401, { error: "Invalid email or password" });
        return true;
      }

      const { token, payload } = await issueAuth(user);
      json(
        res,
        200,
        { user: sanitizeUser(user), token },
        { "Set-Cookie": setAuthTokenCookie(token, payload) }
      );
    } catch (err) {
      json(res, 400, { error: err.message || "Invalid request" });
    }
    return true;
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    await revokeAuthToken(req);
    json(res, 200, { message: "Logged out" }, {
      "Set-Cookie": clearAuthTokenCookie(),
    });
    return true;
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    const user = await getAuthUser(req);
    if (!user) {
      json(res, 401, { error: "Not authenticated" });
      return true;
    }
    const cookies = parseCookies(req.headers.cookie);
    const token =
      getBearerToken(req) || getTokenFromCookies(cookies, AUTH_TOKEN_COOKIE) || undefined;
    json(res, 200, { user, token });
    return true;
  }

  if (pathname === "/api/auth/reset-password" && method === "POST") {
    try {
      const body = await parseJson(req);
      if (!body?.email) {
        json(res, 400, { error: "email is required" });
        return true;
      }

      const generic = {
        message: "If that email exists, a reset link has been sent.",
      };

      const user = await findUserByEmail(body.email);
      if (!user) {
        json(res, 200, generic);
        return true;
      }

      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await upsertUser({
        ...user,
        reset_token: token,
        reset_token_expires: expires,
        updated_at: nowIso(),
      });

      const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const resetUrl = `${baseUrl}/reset-password.html?token=${token}`;
      console.log("[auth] Password reset link:", resetUrl);

      json(res, 200, {
        ...generic,
        resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
      });
    } catch (err) {
      json(res, 400, { error: err.message || "Invalid request" });
    }
    return true;
  }

  if (pathname === "/api/auth/reset-password" && method === "PUT") {
    try {
      const body = await parseJson(req);
      if (!body?.token || !body?.password) {
        json(res, 400, { error: "token and password are required" });
        return true;
      }
      if (body.password.length < 8) {
        json(res, 400, { error: "Password must be at least 8 characters" });
        return true;
      }

      const user = await findUserByResetToken(body.token);
      if (!user || !user.reset_token_expires) {
        json(res, 400, { error: "Invalid or expired reset token" });
        return true;
      }
      if (new Date(user.reset_token_expires) < new Date()) {
        json(res, 400, { error: "Invalid or expired reset token" });
        return true;
      }

      await upsertUser({
        ...user,
        password_hash: hashPassword(body.password),
        reset_token: "",
        reset_token_expires: "",
        updated_at: nowIso(),
      });

      json(res, 200, { message: "Password updated successfully" });
    } catch (err) {
      json(res, 400, { error: err.message || "Invalid request" });
    }
    return true;
  }

  return false;
}

export async function handleApiRequest(req, res) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (pathname.startsWith("/api/")) {
    if (!enforceRateLimit(req, res)) return true;
  }

  if (pathname.startsWith("/api/auth")) {
    const handled = await handleAuth(req, res, pathname, method);
    if (handled) return true;
  }

  if (pathname === "/api/dashboard" && method === "GET") {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        json(res, 401, { error: "Not authenticated" });
        return true;
      }
      const tables = await readDashboardTables();
      json(res, 200, { tables });
    } catch (err) {
      json(res, 500, { error: err.message || "Failed to load dashboard" });
    }
    return true;
  }

  if (pathname === "/api/orders" && method === "GET") {
    try {
      const orders = await readOrders();
      json(res, 200, orders);
    } catch (err) {
      json(res, 500, { error: err.message || "Failed to load orders" });
    }
    return true;
  }

  if (pathname === "/api/orders" && method === "POST") {
    try {
      const order = await parseJson(req);
      if (!order?.stripePaymentIntentId) {
        json(res, 400, { error: "stripePaymentIntentId is required" });
        return true;
      }
      if (!order?.sessionId) {
        json(res, 400, { error: "sessionId is required" });
        return true;
      }
      const user = await getAuthUser(req);
      const saved = await createOrder(order, user?.user_id ?? null);
      json(res, 201, saved);
    } catch (err) {
      json(res, 400, { error: err.message || "Invalid request" });
    }
    return true;
  }

  return false;
}
