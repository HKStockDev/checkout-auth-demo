import { updateCartBadge } from "./cart.js";
import API from "./auth-api.js";
import { authReady, isPublicAuthPage } from "./auth-guard.js";
import { showToast } from "./toast.js";

let closeMenuHandler = null;

function closeUserMenu(menu) {
  const trigger = menu?.querySelector(".user-menu-trigger");
  const dropdown = menu?.querySelector(".user-menu-dropdown");
  if (!dropdown || !trigger) return;
  dropdown.classList.add("hidden");
  trigger.setAttribute("aria-expanded", "false");
  if (closeMenuHandler) {
    document.removeEventListener("click", closeMenuHandler);
    closeMenuHandler = null;
  }
}

function openUserMenu(menu) {
  const trigger = menu.querySelector(".user-menu-trigger");
  const dropdown = menu.querySelector(".user-menu-dropdown");
  dropdown.classList.remove("hidden");
  trigger.setAttribute("aria-expanded", "true");

  closeMenuHandler = (e) => {
    if (!menu.contains(e.target)) closeUserMenu(menu);
  };
  setTimeout(() => document.addEventListener("click", closeMenuHandler), 0);
}

function createUserMenu(user) {
  const menu = document.createElement("div");
  menu.className = "user-menu";
  menu.dataset.authNav = "true";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "user-menu-trigger";
  trigger.setAttribute("aria-label", "Account menu");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `
    <svg class="user-menu-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.75"/>
      <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    </svg>
  `;

  const dropdown = document.createElement("div");
  dropdown.className = "user-menu-dropdown hidden";
  dropdown.setAttribute("role", "menu");

  const header = document.createElement("div");
  header.className = "user-menu-header";

  const name = document.createElement("span");
  name.className = "user-menu-name";
  name.textContent = user.name || "Account";

  const email = document.createElement("span");
  email.className = "user-menu-email";
  email.textContent = user.email;

  header.append(name, email);

  const resetPassword = document.createElement("a");
  resetPassword.href = "reset-password.html";
  resetPassword.className = "user-menu-item";
  resetPassword.setAttribute("role", "menuitem");
  resetPassword.textContent = "Reset password";
  resetPassword.addEventListener("click", () => {
    closeUserMenu(menu);
    showToast("Opening password reset", { type: "info" });
  });

  const logout = document.createElement("button");
  logout.type = "button";
  logout.className = "user-menu-item";
  logout.setAttribute("role", "menuitem");
  logout.textContent = "Sign out";
  logout.addEventListener("click", async () => {
    closeUserMenu(menu);
    showToast("Signing out…", { type: "info", duration: 1200 });
    await API.logout();
    setTimeout(() => {
      window.location.href = "login.html";
    }, 600);
  });

  dropdown.append(header, resetPassword, logout);
  menu.append(trigger, dropdown);

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (isOpen) closeUserMenu(menu);
    else openUserMenu(menu);
  });

  return menu;
}

function renderAuthNav(user) {
  const nav = document.querySelector(".header-nav");
  if (!nav) return;

  nav.querySelectorAll("[data-auth-nav]").forEach((el) => el.remove());

  if (user) {
    nav.append(createUserMenu(user));
  }
}

async function initNav() {
  if (isPublicAuthPage()) return;

  const state = await authReady;
  if (state.redirecting) return;

  updateCartBadge();
  renderAuthNav(state.user);
}

document.addEventListener("DOMContentLoaded", initNav);
