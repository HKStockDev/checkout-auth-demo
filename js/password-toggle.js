const EYE_OPEN = `
  <svg class="password-toggle-icon icon-show" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" fill="none" stroke="currentColor" stroke-width="1.75"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.75"/>
  </svg>
`;

const EYE_CLOSED = `
  <svg class="password-toggle-icon icon-hide hidden" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M6.7 6.7C4.6 8.1 3 10 3 10s3.5 7 10 7c1.5 0 2.9-.4 4.1-1.1M17.3 17.3C19.4 15.9 21 14 21 14s-3.5-7-10-7c-1.5 0-2.9.4-4.1 1.1" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
  </svg>
`;

function createToggleButton(input) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "password-toggle";
  button.setAttribute("aria-label", "Show password");
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = EYE_OPEN + EYE_CLOSED;

  button.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.setAttribute("aria-pressed", String(show));
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    button.querySelector(".icon-show")?.classList.toggle("hidden", show);
    button.querySelector(".icon-hide")?.classList.toggle("hidden", !show);
  });

  return button;
}

export function initPasswordToggles(root = document) {
  root.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.closest(".password-field")) return;

    const wrap = document.createElement("div");
    wrap.className = "password-field";
    input.parentNode.insertBefore(wrap, input);
    wrap.append(input, createToggleButton(input));
  });
}

document.addEventListener("DOMContentLoaded", () => initPasswordToggles());
