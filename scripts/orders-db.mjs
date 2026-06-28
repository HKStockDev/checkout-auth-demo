import { readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { newId, nowIso } from "./auth-db.mjs";
import { getDataDir } from "./data-path.mjs";

function purchaseCsv() {
  return join(getDataDir(), "purchase.csv");
}

function resultCsv() {
  return join(getDataDir(), "result.csv");
}
export const MAX_RESULTS_PER_SESSION = 50;

export const PURCHASE_HEADERS = [
  "purchase_id",
  "user_id",
  "session_id",
  "stripe_payment_intent_id",
  "status",
  "created_at",
  "pdf_url",
];

export const RESULT_HEADERS = ["result_id", "session_id", "name", "value"];

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

export function resultsMapFromRows(rows) {
  const map = {};
  for (const row of rows) {
    map[row.name] = Number(row.value);
  }
  return map;
}

function purchaseToRecord(purchase, resultsBySession) {
  const sessionResults = resultsBySession.get(purchase.session_id) || [];
  return {
    purchaseId: purchase.purchase_id,
    userId: purchase.user_id || null,
    sessionId: purchase.session_id,
    stripePaymentIntentId: purchase.stripe_payment_intent_id,
    status: purchase.status,
    createdAt: purchase.created_at,
    pdfUrl: purchase.pdf_url || "",
    results: resultsMapFromRows(sessionResults),
  };
}

export async function readPurchases() {
  return readTable(purchaseCsv(), PURCHASE_HEADERS);
}

export async function readResults() {
  return readTable(resultCsv(), RESULT_HEADERS);
}

export async function ensureOrderTables() {
  try {
    await access(purchaseCsv());
  } catch {
    await writeTable(purchaseCsv(), PURCHASE_HEADERS, []);
  }
  try {
    await access(resultCsv());
  } catch {
    await writeTable(resultCsv(), RESULT_HEADERS, []);
  }
}

export async function readOrders() {
  const purchases = await readPurchases();
  if (!purchases.length) return [];

  const results = await readResults();
  const resultsBySession = new Map();
  for (const row of results) {
    const list = resultsBySession.get(row.session_id) || [];
    list.push(row);
    resultsBySession.set(row.session_id, list);
  }

  return purchases
    .map((p) => purchaseToRecord(p, resultsBySession))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function normalizeResultsInput(results) {
  if (!results || typeof results !== "object") return {};
  const normalized = {};
  for (const [name, value] of Object.entries(results)) {
    const key = String(name).trim();
    if (!key) continue;
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new Error(`Result "${key}" must be a numerical value`);
    }
    normalized[key] = num;
  }
  if (Object.keys(normalized).length > MAX_RESULTS_PER_SESSION) {
    throw new Error(`At most ${MAX_RESULTS_PER_SESSION} results allowed per session`);
  }
  return normalized;
}

export async function saveSessionResults(sessionId, resultsInput) {
  const resultsMap = normalizeResultsInput(resultsInput);
  const allResults = await readResults();
  const filtered = allResults.filter((r) => r.session_id !== sessionId);

  for (const [name, value] of Object.entries(resultsMap)) {
    filtered.push({
      result_id: newId(),
      session_id: sessionId,
      name,
      value,
    });
  }

  await writeTable(resultCsv(), RESULT_HEADERS, filtered);
  return resultsMap;
}

export async function createOrder(order, userId = null) {
  if (!order?.sessionId) throw new Error("sessionId is required");
  if (!order?.stripePaymentIntentId) throw new Error("stripePaymentIntentId is required");

  const purchaseId = newId();
  const createdAt = order.createdAt || nowIso();
  const pdfUrl = order.pdfUrl || `/receipts/${purchaseId}.pdf`;

  const purchases = await readPurchases();
  purchases.push({
    purchase_id: purchaseId,
    user_id: userId ?? order.userId ?? "",
    session_id: order.sessionId,
    stripe_payment_intent_id: order.stripePaymentIntentId,
    status: order.status ?? "confirmed",
    created_at: createdAt,
    pdf_url: pdfUrl,
  });
  await writeTable(purchaseCsv(), PURCHASE_HEADERS, purchases);

  const results = await saveSessionResults(order.sessionId, order.results ?? {});

  return {
    purchaseId,
    userId: userId ?? order.userId ?? null,
    sessionId: order.sessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    status: order.status ?? "confirmed",
    createdAt,
    pdfUrl,
    results,
    customer: order.customer,
  };
}

const DEMO_DATA = [
  {
    sessionId: "sess_demo001",
    stripePaymentIntentId: "pi_3Demo44289100000001",
    status: "confirmed",
    createdAt: "2026-06-20T10:30:00.000Z",
    pdfUrl: "/receipts/demo001.pdf",
    results: {
      total: 89,
      item_count: 1,
      item_dead_sea_mud_mask_qty: 1,
      item_dead_sea_mud_mask_price: 89,
    },
  },
  {
    sessionId: "sess_demo002",
    stripePaymentIntentId: "pi_3Demo55120300000002",
    status: "confirmed",
    createdAt: "2026-06-22T14:15:00.000Z",
    pdfUrl: "/receipts/demo002.pdf",
    results: {
      total: 32,
      item_count: 1,
      item_bamba_family_pack_qty: 1,
      item_bamba_family_pack_price: 32,
    },
  },
  {
    sessionId: "sess_demo003",
    stripePaymentIntentId: "pi_3Demo66301400000003",
    status: "confirmed",
    createdAt: "2026-06-25T09:00:00.000Z",
    pdfUrl: "/receipts/demo003.pdf",
    results: {
      total: 95,
      item_count: 1,
      item_galil_wine_red_qty: 1,
      item_galil_wine_red_price: 95,
    },
  },
];

export async function seedDemoOrders() {
  const purchases = await readPurchases();
  if (purchases.length > 0) return;

  for (const demo of DEMO_DATA) {
    await createOrder(demo);
  }
}
