let hideTimer = null;

export function showToast(message, { type = "info", duration = 2200 } = {}) {
  if (!message) return;

  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `app-toast app-toast--${type} visible`;

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, duration);
}

export function bindNavigationToast(element, message, { type = "info", delay = 350 } = {}) {
  if (!element) return;

  element.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const href = element.getAttribute("href");
    if (!href || href === "#") return;

    e.preventDefault();
    showToast(message, { type });
    setTimeout(() => {
      window.location.href = href;
    }, delay);
  });
}
