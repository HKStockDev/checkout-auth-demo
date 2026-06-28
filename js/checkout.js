import { authReady } from "./auth-guard.js";
import {
  createStripePayment,
  formatCurrency,
  saveOrderToSession,
} from "./utils.js";
import { appendOrderToHistory } from "./orders-api.js";
import {
  buildNumericalResults,
  clearCheckoutSessionId,
  getOrCreateCheckoutSessionId,
} from "./purchase-results.js";
import { getProductById, getProductImage } from "./products.js";
import { getCart, getCartTotal, clearCart, addToCart } from "./cart.js";
import {
  validateCheckoutForm,
  formatCardNumberInput,
  formatExpiryInput,
  digitsOnly,
} from "./checkout-validation.js";
import { bindNavigationToast, showToast } from "./toast.js";

let cartItems = [];
const touchedFields = new Set();

const VALIDATED_FIELD_IDS = [
  "name",
  "email",
  "phone",
  "card-name",
  "card-number",
  "card-expiry",
  "card-cvv",
];

function populateUserFields(user) {
  if (!user) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  if (nameInput) {
    nameInput.value = user.name || "";
    nameInput.disabled = true;
    touchedFields.add("name");
  }

  if (emailInput) {
    emailInput.value = user.email || "";
    emailInput.disabled = true;
    touchedFields.add("email");
  }
}

function initCartFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");
  if (productId && getProductById(productId)) {
    clearCart();
    addToCart(productId, 1);
    showToast(`${getProductById(productId).name} added for checkout`, { type: "success" });
    window.history.replaceState({}, "", "checkout.html");
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSummary() {
  const container = document.getElementById("summary-items");
  const total = getCartTotal();

  container.innerHTML = cartItems
    .map(
      (item) => `
      <div class="order-summary-item order-summary-item--with-image">
        <div class="summary-item-left">
          <img src="${escapeHtml(getProductImage(item))}" alt="" class="summary-item-thumb" width="40" height="30" />
          <span>${escapeHtml(item.name)}${item.qty > 1 ? ` ×${item.qty}` : ""}</span>
        </div>
        <span>${formatCurrency(item.price * item.qty)}</span>
      </div>
    `
    )
    .join("");

  document.getElementById("summary-total").textContent = formatCurrency(total);
}

function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (!input || !errorEl) return;

  if (message) {
    input.classList.add("input-invalid");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  } else {
    input.classList.remove("input-invalid");
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

function updateFormState({ showErrors = false } = {}) {
  const form = document.getElementById("checkout-form");
  const btn = document.getElementById("submit-btn");
  if (!form || !btn) return;

  const { valid, fields } = validateCheckoutForm(form);

  VALIDATED_FIELD_IDS.forEach((id) => {
    if (showErrors || touchedFields.has(id)) {
      showFieldError(id, fields[id]?.valid ? "" : fields[id]?.message || "");
    }
  });

  btn.disabled = !valid;
}

function setupValidationListeners() {
  const form = document.getElementById("checkout-form");

  VALIDATED_FIELD_IDS.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", () => {
      touchedFields.add(id);
      updateFormState();
    });

    input.addEventListener("blur", () => {
      touchedFields.add(id);
      updateFormState({ showErrors: true });
    });
  });

  const cardNumber = document.getElementById("card-number");
  cardNumber.addEventListener("input", () => {
    const pos = cardNumber.selectionStart;
    const before = cardNumber.value.length;
    cardNumber.value = formatCardNumberInput(cardNumber.value);
    const after = cardNumber.value.length;
    cardNumber.setSelectionRange(pos + (after - before), pos + (after - before));
  });

  const cardExpiry = document.getElementById("card-expiry");
  cardExpiry.addEventListener("input", () => {
    cardExpiry.value = formatExpiryInput(cardExpiry.value);
  });

  const cardCvv = document.getElementById("card-cvv");
  cardCvv.addEventListener("input", () => {
    cardCvv.value = digitsOnly(cardCvv.value).slice(0, 4);
  });

  form.addEventListener("submit", (e) => {
    VALIDATED_FIELD_IDS.forEach((id) => touchedFields.add(id));
  });
}

async function handleSubmit(e) {
  e.preventDefault();

  VALIDATED_FIELD_IDS.forEach((id) => touchedFields.add(id));
  updateFormState({ showErrors: true });

  const form = document.getElementById("checkout-form");
  const { valid } = validateCheckoutForm(form);
  if (!valid) {
    showToast("Please fix the highlighted fields before placing your order.", { type: "error" });
    return;
  }

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Processing…';
  showToast("Processing payment…", { type: "info", duration: 3000 });

  const customer = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
  };

  const items = cartItems.map(({ id, name, price, qty }) => ({
    id,
    name,
    price,
    qty,
  }));

  const total = getCartTotal();
  const sessionId = getOrCreateCheckoutSessionId();
  const results = buildNumericalResults(items, total);

  try {
    const paymentResult = await createStripePayment({ sessionId, total });

    const purchase = {
      ...paymentResult,
      results,
      customer,
    };
    const saved = await appendOrderToHistory(purchase);
    saveOrderToSession(saved);
    clearCheckoutSessionId();
    clearCart();
    showToast("Order placed successfully. Redirecting…", { type: "success", duration: 1200 });
    setTimeout(() => {
      window.location.href = "success.html";
    }, 600);
  } catch (err) {
    console.error(err);
    btn.textContent = "Place Order";
    updateFormState();
    showToast("Checkout failed. Please try again.", { type: "error" });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await authReady;
  if (state.redirecting) return;

  initCartFromUrl();
  cartItems = getCart();

  if (!cartItems.length) {
    window.location.href = "cart.html";
    return;
  }

  populateUserFields(state.user);
  renderSummary();
  setupValidationListeners();
  bindNavigationToast(
    document.querySelector('a[href="cart.html"]'),
    "Returning to cart",
    { type: "info" }
  );

  document.getElementById("checkout-form").addEventListener("submit", handleSubmit);

  updateFormState();
});
