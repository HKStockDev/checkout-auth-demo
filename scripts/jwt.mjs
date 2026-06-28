import { createHmac, timingSafeEqual } from "node:crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-change-me-in-production-min-32-chars";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function decodeBase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function parseExpiresIn(value) {
  if (typeof value === "number") return value;
  const str = String(value).trim();
  const match = str.match(/^(\d+)([smhd])?$/i);
  if (!match) return 7 * 24 * 60 * 60;
  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] || 1);
}

export function signToken(user, sessionId) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.user_id,
    email: user.email,
    name: user.name,
    sid: sessionId,
    iat: now,
    exp: now + parseExpiresIn(JWT_EXPIRES_IN),
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", JWT_SECRET).update(data).digest("base64url");

  return `${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac("sha256", JWT_SECRET).update(data).digest("base64url");

  try {
    const sigBuf = Buffer.from(signature, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64url(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export function getTokenFromCookies(cookies, cookieName = "auth_token") {
  return cookies[cookieName] || null;
}

export { JWT_EXPIRES_IN, JWT_SECRET };
