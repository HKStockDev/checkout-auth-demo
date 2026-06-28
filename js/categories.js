import { authReady } from "./auth-guard.js";
import { PRODUCTS } from "./products.js";
import { createProductCard } from "./product-ui.js";

function renderProductList() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  PRODUCTS.forEach((product) => {
    grid.appendChild(createProductCard(product));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await authReady;
  if (state.redirecting) return;
  renderProductList();
});
