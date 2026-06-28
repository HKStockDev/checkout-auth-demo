/** Helpers for purchase records and session-scoped numerical results. */

export const MAX_RESULTS_PER_SESSION = 50;

export function sanitizeResultName(part) {
  return String(part).replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

export function buildNumericalResults(items, total) {
  const results = {
    total,
    item_count: items.length,
  };

  for (const item of items) {
    if (Object.keys(results).length >= MAX_RESULTS_PER_SESSION) break;
    const key = sanitizeResultName(item.id || "unknown");
    results[`item_${key}_qty`] = item.qty || 1;
    if (Object.keys(results).length >= MAX_RESULTS_PER_SESSION) break;
    results[`item_${key}_price`] = item.price ?? 0;
  }

  return results;
}

export function getResultTotal(results) {
  const total = results?.total;
  return Number.isFinite(total) ? total : 0;
}

export function formatResultsSummary(results) {
  const count = results?.item_count ?? 0;
  if (!count) return "-";
  if (count === 1) {
    const itemKey = Object.keys(results || {}).find((k) => k.endsWith("_qty"));
    if (itemKey) {
      const slug = itemKey.replace(/^item_/, "").replace(/_qty$/, "");
      return slug.replace(/_/g, " ");
    }
  }
  return `${count} items`;
}

export function getOrCreateCheckoutSessionId() {
  const key = "checkoutSessionId";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function clearCheckoutSessionId() {
  sessionStorage.removeItem("checkoutSessionId");
}
