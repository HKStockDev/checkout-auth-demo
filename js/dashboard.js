import { authReady } from "./auth-guard.js";
import { showToast } from "./toast.js";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTableContent({ file, headers, rows }) {
  const wrap = document.createElement("div");

  const meta = document.createElement("div");
  meta.className = "history-toolbar dashboard-tab-meta";
  meta.innerHTML = `
    <p class="dashboard-section-file"><code>${escapeHtml(file)}</code></p>
    <span class="history-count">${rows.length} row${rows.length === 1 ? "" : "s"}</span>
  `;
  wrap.append(meta);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No rows yet.";
    wrap.append(empty);
    return wrap;
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "history-table-wrap";

  const table = document.createElement("table");
  table.className = "history-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;

  const tbody = document.createElement("tbody");
  tbody.innerHTML = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((h) => `<td>${escapeHtml(row[h] ?? "")}</td>`)
          .join("")}</tr>`
    )
    .join("");

  table.append(thead, tbody);
  tableWrap.append(table);
  wrap.append(tableWrap);
  return wrap;
}

function initTabs(container) {
  const tabs = container.querySelectorAll(".tab[data-tab]");
  const panels = container.querySelectorAll("[data-panel]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== target));
      showToast(`Showing ${target} table`, { type: "info" });
    });
  });
}

function showError(message) {
  const el = document.getElementById("dashboard-error");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function renderDashboard(tables) {
  const root = document.getElementById("dashboard-root");
  if (!root || !tables.length) return;

  const card = document.createElement("div");
  card.className = "card dashboard-panel";

  const tabList = document.createElement("div");
  tabList.className = "tabs dashboard-tabs";
  tabList.setAttribute("role", "tablist");

  tables.forEach((table, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `tab${index === 0 ? " active" : ""}`;
    tab.dataset.tab = table.name;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tab.textContent = `${table.name} (${table.rows.length})`;
    tabList.append(tab);
  });

  const panels = document.createElement("div");
  panels.className = "dashboard-tab-panels";

  tables.forEach((table, index) => {
    const panel = document.createElement("section");
    panel.className = `dashboard-tab-panel${index === 0 ? "" : " hidden"}`;
    panel.dataset.panel = table.name;
    panel.setAttribute("role", "tabpanel");
    panel.append(renderTableContent(table));
    panels.append(panel);
  });

  card.append(tabList, panels);
  root.innerHTML = "";
  root.append(card);
  initTabs(card);
}

async function fetchDashboardTables() {
  const res = await fetch("/api/dashboard");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to load dashboard (${res.status})`);
  }
  const data = await res.json();
  return data.tables || [];
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await authReady;
  if (state.redirecting) return;

  try {
    const tables = await fetchDashboardTables();
    renderDashboard(tables);
    showToast("Dashboard data loaded", { type: "success" });
  } catch (err) {
    showError(err.message || "Could not load dashboard data.");
    showToast(err.message || "Could not load dashboard data.", { type: "error" });
    const root = document.getElementById("dashboard-root");
    if (root) root.innerHTML = "";
  }
});
