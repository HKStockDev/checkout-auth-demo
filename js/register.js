import "./password-toggle.js";
import API, { getRedirectTarget, hideAlert, showAlert } from "./auth-api.js";
import { bindNavigationToast, showToast } from "./toast.js";

const form = document.getElementById("register-form");
const alertEl = document.getElementById("auth-alert");
const submitBtn = document.getElementById("register-submit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert(alertEl);

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) {
    showAlert(alertEl, "Passwords do not match");
    showToast("Passwords do not match", { type: "error" });
    return;
  }

  submitBtn.disabled = true;
  showToast("Creating your account…", { type: "info", duration: 1500 });
  const { ok, data } = await API.register(name, email, password);
  submitBtn.disabled = false;

  if (!ok) {
    showAlert(alertEl, data.error || "Registration failed");
    showToast(data.error || "Registration failed", { type: "error" });
    return;
  }

  showToast("Account created successfully. Redirecting…", { type: "success", duration: 1200 });
  setTimeout(() => {
    window.location.href = getRedirectTarget();
  }, 600);
});

bindNavigationToast(document.querySelector('a[href="login.html"]'), "Opening sign in", { type: "info" });
