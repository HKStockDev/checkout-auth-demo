const LOCAL_KEY = "shopDemoPurchases";

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

function rowsFromCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function resultsMapFromRows(rows) {
  const map = {};
  for (const row of rows) {
    map[row.name] = Number(row.value);
  }
  return map;
}

function purchasesFromCsv(purchaseText, resultText) {
  const purchases = rowsFromCsv(purchaseText);
  const results = rowsFromCsv(resultText);
  const resultsBySession = new Map();

  for (const row of results) {
    const list = resultsBySession.get(row.session_id) || [];
    list.push(row);
    resultsBySession.set(row.session_id, list);
  }

  return purchases
    .map((p) => ({
      purchaseId: p.purchase_id,
      userId: p.user_id || null,
      sessionId: p.session_id,
      stripePaymentIntentId: p.stripe_payment_intent_id,
      status: p.status,
      createdAt: p.created_at,
      pdfUrl: p.pdf_url || "",
      results: resultsMapFromRows(resultsBySession.get(p.session_id) || []),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function loadLocalPurchases() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPurchases(purchases) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(purchases));
}

function mergePurchases(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const purchase of list) {
      map.set(purchase.purchaseId || purchase.stripePaymentIntentId, purchase);
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function fetchPurchasesFromCsv() {
  const [purchaseRes, resultRes] = await Promise.all([
    fetch("data/purchase.csv"),
    fetch("data/result.csv"),
  ]);
  if (!purchaseRes.ok || !resultRes.ok) return null;
  const [purchaseText, resultText] = await Promise.all([
    purchaseRes.text(),
    resultRes.text(),
  ]);
  return purchasesFromCsv(purchaseText, resultText);
}

export async function fetchOrderHistory() {
  try {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const purchases = await res.json();
      saveLocalPurchases(purchases);
      return purchases;
    }
  } catch {
    /* static fallback */
  }

  try {
    const fromCsv = await fetchPurchasesFromCsv();
    if (fromCsv?.length) {
      return mergePurchases(fromCsv, loadLocalPurchases());
    }
  } catch {
    /* ignore */
  }

  return loadLocalPurchases();
}

export async function appendOrderToHistory(purchase) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchase),
    });
    if (res.ok) {
      const saved = await res.json();
      const local = loadLocalPurchases();
      saveLocalPurchases(mergePurchases(local, [saved]));
      return saved;
    }
  } catch {
    /* static fallback */
  }

  const local = loadLocalPurchases();
  const updated = mergePurchases(local, [purchase]);
  saveLocalPurchases(updated);
  return purchase;
}

export function formatOrderDate(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
