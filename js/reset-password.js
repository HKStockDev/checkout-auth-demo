import "./password-toggle.js";
import API, { hideAlert, showAlert } from "./auth-api.js";
import { bindNavigationToast, showToast } from "./toast.js";

const requestForm = document.getElementById("reset-request-form");
const confirmForm = document.getElementById("reset-confirm-form");
const alertEl = document.getElementById("auth-alert");
const requestBtn = document.getElementById("reset-request-submit");
const confirmBtn = document.getElementById("reset-confirm-submit");
const requestPanel = document.getElementById("reset-request-panel");
const confirmPanel = document.getElementById("reset-confirm-panel");
const switchToConfirm = document.getElementById("switch-to-confirm");
const switchToRequest = document.getElementById("switch-to-request");

const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token") || "";
const emailInput = document.getElementById("email");

if (tokenFromUrl) {
  document.getElementById("token").value = tokenFromUrl;
  requestPanel?.classList.add("hidden");
  confirmPanel?.classList.remove("hidden");
}

async function initLoggedInEmail() {
  if (!emailInput || tokenFromUrl) return;

  try {
    const { ok, data } = await API.me();
    if (ok && data.user?.email) {
      emailInput.value = data.user.email;
      emailInput.disabled = true;
    }
  } catch {
    /* allow manual email entry when not signed in */
  }
}

initLoggedInEmail();

switchToConfirm?.addEventListener("click", () => {
  requestPanel?.classList.add("hidden");
  confirmPanel?.classList.remove("hidden");
  hideAlert(alertEl);
  showToast("Enter your reset token and new password", { type: "info" });
});

switchToRequest?.addEventListener("click", () => {
  confirmPanel?.classList.add("hidden");
  requestPanel?.classList.remove("hidden");
  hideAlert(alertEl);
  showToast("Request a new password reset link", { type: "info" });
});

requestForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert(alertEl);
  requestBtn.disabled = true;
  showToast("Sending reset link…", { type: "info", duration: 1500 });

  const email = document.getElementById("email").value.trim();
  const { ok, data } = await API.requestPasswordReset(email);
  requestBtn.disabled = false;

  if (!ok) {
    showAlert(alertEl, data.error || "Request failed");
    showToast(data.error || "Request failed", { type: "error" });
    return;
  }

  if (data.resetUrl) {
    showToast("Reset link ready. Redirecting…", { type: "success", duration: 1200 });
    setTimeout(() => {
      window.location.href = data.resetUrl;
    }, 600);
    return;
  }

  showAlert(alertEl, data.message, "success");
  showToast(data.message || "Reset link sent", { type: "success" });
});

confirmForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert(alertEl);

  const token = document.getElementById("token").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) {
    showAlert(alertEl, "Passwords do not match");
    showToast("Passwords do not match", { type: "error" });
    return;
  }

  confirmBtn.disabled = true;
  showToast("Updating password…", { type: "info", duration: 1500 });
  const { ok, data } = await API.confirmPasswordReset(token, password);
  confirmBtn.disabled = false;

  if (!ok) {
    showAlert(alertEl, data.error || "Reset failed");
    showToast(data.error || "Reset failed", { type: "error" });
    confirmBtn.disabled = false;
    return;
  }

  showAlert(alertEl, `${data.message} Redirecting to sign in…`, "success");
  showToast("Password updated successfully. Redirecting to sign in…", {
    type: "success",
    duration: 1500,
  });
  await API.logout().catch(() => {});
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
});

bindNavigationToast(document.querySelector('a[href="login.html"]'), "Returning to sign in", { type: "info" });
