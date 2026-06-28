import { readFile, writeFile, access } from "node:fs/promises";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { join } from "node:path";
import { getDataDir } from "./data-path.mjs";

function usersCsv() {
  return join(getDataDir(), "users.csv");
}

function sessionsCsv() {
  return join(getDataDir(), "sessions.csv");
}

export const USER_HEADERS = [
  "user_id",
  "email",
  "password_hash",
  "name",
  "reset_token",
  "reset_token_expires",
  "created_at",
  "updated_at",
];

export const SESSION_HEADERS = [
  "session_id",
  "user_id",
  "expires_at",
  "created_at",
];

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = false;
      } else current += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      fields.push(current);
      current = "";
    } else current += ch;
  }
  fields.push(current);
  return fields;
}

function escapeCsv(value) {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowsFromCsv(text, headers) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const fileHeaders = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    fileHeaders.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    for (const h of headers) {
      if (!(h in row)) row[h] = "";
    }
    return row;
  });
}

function rowsToCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

async function readTable(filePath, headers) {
  try {
    const text = await readFile(filePath, "utf-8");
    return rowsFromCsv(text, headers);
  } catch {
    return [];
  }
}

async function writeTable(filePath, headers, rows) {
  await writeFile(filePath, rowsToCsv(headers, rows), "utf-8");
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = scryptSync(password, salt, 64).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
  } catch {
    return false;
  }
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, reset_token, reset_token_expires, ...safe } = user;
  return safe;
}

export async function readUsers() {
  return readTable(usersCsv(), USER_HEADERS);
}

export async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(userId) {
  const users = await readUsers();
  return users.find((u) => u.user_id === userId) || null;
}

export async function findUserByResetToken(token) {
  const users = await readUsers();
  return users.find((u) => u.reset_token === token) || null;
}

export async function upsertUser(user) {
  const users = await readUsers();
  const index = users.findIndex((u) => u.user_id === user.user_id);
  if (index >= 0) users[index] = user;
  else users.push(user);
  await writeTable(usersCsv(), USER_HEADERS, users);
  return user;
}

export async function readSessions() {
  return readTable(sessionsCsv(), SESSION_HEADERS);
}

export async function findSession(sessionId) {
  const sessions = await readSessions();
  return sessions.find((s) => s.session_id === sessionId) || null;
}

export async function createSession(userId, ttlMs) {
  const now = nowIso();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const session = {
    session_id: newId(),
    user_id: userId,
    expires_at: expiresAt,
    created_at: now,
  };
  const sessions = await readSessions();
  sessions.push(session);
  await writeTable(sessionsCsv(), SESSION_HEADERS, sessions);
  return session;
}

export async function deleteSession(sessionId) {
  const sessions = await readSessions();
  const filtered = sessions.filter((s) => s.session_id !== sessionId);
  await writeTable(sessionsCsv(), SESSION_HEADERS, filtered);
}

export async function ensureAuthTables() {
  try {
    await access(usersCsv());
  } catch {
    await writeTable(usersCsv(), USER_HEADERS, []);
  }
  try {
    await access(sessionsCsv());
  } catch {
    await writeTable(sessionsCsv(), SESSION_HEADERS, []);
  }
}
