import { authReady } from "./auth-guard.js";
import { loadOrderFromSession, formatCurrency } from "./utils.js";
import { formatResultsSummary, getResultTotal } from "./purchase-results.js";
import { bindNavigationToast, showToast } from "./toast.js";

function renderPurchase(purchase) {
  document.getElementById("payment-id").textContent = purchase.stripePaymentIntentId;
  document.getElementById("purchase-id").textContent = purchase.purchaseId;

  document.getElementById("customer-name").textContent = purchase.customer?.name ?? "-";
  document.getElementById("customer-email").textContent = purchase.customer?.email ?? "-";
  document.getElementById("order-total").textContent = formatCurrency(getResultTotal(purchase.results));

  const itemsText = formatResultsSummary(purchase.results);
  document.getElementById("order-items").textContent = itemsText;

  const pdfLink = document.getElementById("pdf-link");
  if (purchase.pdfUrl) {
    pdfLink.href = purchase.pdfUrl;
    pdfLink.textContent = purchase.pdfUrl;
    pdfLink.classList.remove("hidden");
  } else {
    pdfLink.classList.add("hidden");
  }

  document.getElementById("email-payment-id").textContent = purchase.stripePaymentIntentId;
  document.getElementById("email-customer-name").textContent = purchase.customer?.name ?? "Customer";
  document.getElementById("email-total").textContent = formatCurrency(getResultTotal(purchase.results));
  document.getElementById("email-product").textContent = itemsText;
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll("[data-panel]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      if (!target) return;

      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== target));

      if (target === "details") {
        showToast("Showing order details", { type: "info" });
      } else if (target === "email") {
        showToast("Showing confirmation email preview", { type: "info" });
      }
    });
  });
}

function bindSuccessCtas() {
  bindNavigationToast(
    document.querySelector('a.btn-secondary[href="index.html"]'),
    "Returning to shop",
    { type: "info" }
  );
  bindNavigationToast(
    document.querySelector('a.btn-primary[href="dashboard.html"]'),
    "Opening dashboard",
    { type: "info" }
  );
  bindNavigationToast(
    document.querySelector('a.tab-link[href="dashboard.html"]'),
    "Opening dashboard",
    { type: "info" }
  );

  const pdfLink = document.getElementById("pdf-link");
  pdfLink?.addEventListener("click", () => {
    if (pdfLink.classList.contains("hidden") || pdfLink.getAttribute("href") === "#") return;
    showToast("Opening receipt PDF", { type: "info" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await authReady;
  if (state.redirecting) return;

  const purchase = loadOrderFromSession();

  if (!purchase) {
    window.location.href = "index.html";
    return;
  }

  renderPurchase(purchase);
  initTabs();
  bindSuccessCtas();
  showToast("Order confirmed successfully", { type: "success" });
});
