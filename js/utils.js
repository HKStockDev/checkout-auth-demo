/**
 * Parses Google Places address_components for local addresses.
 * Maps: route + street_number → street, locality/administrative_area → city, postal_code → zip.
 */
export function parseAddress(place) {
  const components = place.address_components || [];
  const get = (type) => {
    const c = components.find((x) => x.types.includes(type));
    return c ? c.long_name : "";
  };

  const streetNumber = get("street_number");
  const route = get("route");
  const street = [route, streetNumber].filter(Boolean).join(" ").trim();

  const city =
    get("locality") ||
    get("sublocality") ||
    get("administrative_area_level_2") ||
    get("administrative_area_level_1");

  const zip = get("postal_code");

  return {
    street: street || place.name || "",
    city,
    zip,
    formatted: place.formatted_address || "",
  };
}

/**
 * Mock Stripe payment: creates a payment intent id used as the customer-facing order reference.
 * In production this would call Stripe Checkout or Payment Intents and return the real payment id.
 */
export async function createStripePayment({ sessionId, total }) {
  await delay(800);

  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  const stripePaymentIntentId = `pi_3${suffix}`;

  return {
    sessionId,
    stripePaymentIntentId,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    total,
  };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function saveOrderToSession(purchase) {
  sessionStorage.setItem("lastOrder", JSON.stringify(purchase));
}

export function loadOrderFromSession() {
  const raw = sessionStorage.getItem("lastOrder");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
