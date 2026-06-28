import { formatCurrency } from "./utils.js";
import { getProductImage } from "./products.js";
import { addToCart, buyNow } from "./cart.js";
import { showToast } from "./toast.js";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createProductCard(product, { featured = false } = {}) {
  const card = document.createElement("article");
  card.className = `product-card${featured ? " product-card--featured" : ""}`;

  const badge = product.badge
    ? `<span class="product-badge">${escapeHtml(product.badge)}</span>`
    : "";

  const img = getProductImage(product);

  card.innerHTML = `
    <div class="product-card-image-wrap">
      <img
        class="product-card-image"
        src="${escapeHtml(img)}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
        width="480"
        height="360"
      />
      <div class="product-card-overlay">
        ${badge}
        <p class="product-desc">${escapeHtml(product.description || "")}</p>
      </div>
    </div>
    <div class="product-card-bottom">
      <div class="product-card-meta">
        <span class="product-price">${formatCurrency(product.price)}</span>
        <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
      </div>
      <div class="product-card-actions">
        <button type="button" class="btn btn-secondary btn-sm btn-add-cart" data-id="${escapeHtml(product.id)}">Add to cart</button>
        <button type="button" class="btn btn-primary btn-sm btn-buy-now" data-id="${escapeHtml(product.id)}">Buy now</button>
      </div>
    </div>
  `;

  card.querySelector(".btn-add-cart").addEventListener("click", (e) => {
    const id = e.currentTarget.dataset.id;
    addToCart(id);
    showToast(`${product.name} added to cart`, { type: "success" });
  });

  card.querySelector(".btn-buy-now").addEventListener("click", () => {
    showToast(`Starting checkout for ${product.name}`, { type: "info" });
    setTimeout(() => buyNow(product.id), 350);
  });

  return card;
}

export function formatItemsSummary(items) {
  if (!items?.length) return "-";
  if (items.length === 1) {
    const i = items[0];
    return i.qty > 1 ? `${i.name} ×${i.qty}` : i.name;
  }
  return items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ");
}
