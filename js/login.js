import "./password-toggle.js";
import API, { getRedirectTarget, hideAlert, showAlert } from "./auth-api.js";
import { bindNavigationToast, showToast } from "./toast.js";

const form = document.getElementById("login-form");
const alertEl = document.getElementById("auth-alert");
const submitBtn = document.getElementById("login-submit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert(alertEl);
  submitBtn.disabled = true;
  showToast("Signing in…", { type: "info", duration: 1500 });

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { ok, data } = await API.login(email, password);
  submitBtn.disabled = false;

  if (!ok) {
    showAlert(alertEl, data.error || "Login failed");
    showToast(data.error || "Login failed", { type: "error" });
    return;
  }

  showToast("Signed in successfully. Redirecting…", { type: "success", duration: 1200 });
  setTimeout(() => {
    window.location.href = getRedirectTarget();
  }, 600);
});

bindNavigationToast(document.querySelector('a[href="reset-password.html"]'), "Opening password reset", {
  type: "info",
});
bindNavigationToast(document.querySelector('a[href="register.html"]'), "Opening account registration", {
  type: "info",
});
