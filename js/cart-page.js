import { authReady } from "./auth-guard.js";
import { getCart, getCartTotal, setCartQty, removeFromCart } from "./cart.js";
import { formatCurrency } from "./utils.js";
import { getProductImage } from "./products.js";
import { bindNavigationToast, showToast } from "./toast.js";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cart-list");
  const empty = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!cart.length) {
    empty?.classList.remove("hidden");
    list.innerHTML = "";
    summary?.classList.add("hidden");
    checkoutBtn?.classList.add("hidden");
    return;
  }

  empty?.classList.add("hidden");
  summary?.classList.remove("hidden");
  checkoutBtn?.classList.remove("hidden");

  list.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item" data-id="${escapeHtml(item.id)}">
        <img class="cart-item-image" src="${escapeHtml(getProductImage(item))}" alt="" width="96" height="72" />
        <div class="cart-item-info">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="cart-item-price">${formatCurrency(item.price)} each</p>
          <div class="cart-item-controls">
            <label class="qty-label">
              Qty
              <input type="number" class="qty-input" min="1" max="99" value="${item.qty}" data-id="${escapeHtml(item.id)}" />
            </label>
            <button type="button" class="btn-link btn-remove" data-id="${escapeHtml(item.id)}">Remove</button>
          </div>
        </div>
        <div class="cart-item-line-total">${formatCurrency(item.price * item.qty)}</div>
      </article>
    `
    )
    .join("");

  document.getElementById("cart-subtotal").textContent = formatCurrency(getCartTotal());
  document.getElementById("cart-total").textContent = formatCurrency(getCartTotal());

  list.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", () => {
      const item = cart.find((entry) => entry.id === input.dataset.id);
      setCartQty(input.dataset.id, Number(input.value) || 1);
      showToast(
        item ? `Updated ${item.name} quantity to ${Number(input.value) || 1}` : "Cart updated",
        { type: "success" }
      );
      renderCart();
    });
  });

  list.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = cart.find((entry) => entry.id === btn.dataset.id);
      removeFromCart(btn.dataset.id);
      showToast(item ? `${item.name} removed from cart` : "Item removed from cart", { type: "info" });
      renderCart();
    });
  });
}

function bindCartCtas() {
  bindNavigationToast(
    document.querySelector("#cart-empty a.btn-primary"),
    "Opening the shop",
    { type: "info" }
  );
  bindNavigationToast(
    document.getElementById("checkout-btn"),
    "Proceeding to checkout",
    { type: "info" }
  );
  bindNavigationToast(
    document.querySelector("#cart-summary a[href='index.html']"),
    "Continuing shopping",
    { type: "info" }
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await authReady;
  if (state.redirecting) return;
  bindCartCtas();
  renderCart();
});
