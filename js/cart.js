import { getProductById } from "./products.js";

const CART_KEY = "shopDemoCart";

function loadRaw() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRaw(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart() {
  return loadRaw()
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: Math.max(1, entry.qty || 1),
      };
    })
    .filter(Boolean);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function addToCart(productId, qty = 1) {
  const items = loadRaw();
  const existing = items.find((i) => i.id === productId);
  if (existing) {
    existing.qty = (existing.qty || 1) + qty;
  } else {
    items.push({ id: productId, qty });
  }
  saveRaw(items);
  updateCartBadge();
  return getCart();
}

export function setCartQty(productId, qty) {
  let items = loadRaw();
  if (qty <= 0) {
    items = items.filter((i) => i.id !== productId);
  } else {
    const entry = items.find((i) => i.id === productId);
    if (entry) entry.qty = qty;
  }
  saveRaw(items);
  updateCartBadge();
  return getCart();
}

export function removeFromCart(productId) {
  return setCartQty(productId, 0);
}

export function clearCart() {
  saveRaw([]);
  updateCartBadge();
}

export function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

export function buyNow(productId) {
  clearCart();
  addToCart(productId, 1);
  window.location.href = "checkout.html";
}
