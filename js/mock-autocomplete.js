import {
  searchIsraelMockAddresses,
  getAddressesByCity,
  MOCK_STATS,
} from "./israel-address-data.js";

export { MOCK_STATS, getAddressesByCity };

export function initMockAutocomplete(input, onSelect) {
  let dropdown = null;

  function closeDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
  }

  function openDropdown(matches) {
    closeDropdown();
    if (!matches.length) {
      showStatus(`No match - ${MOCK_STATS.cities} cities in database`);
      return;
    }

    dropdown = document.createElement("ul");
    dropdown.className = "mock-autocomplete-list";
    dropdown.setAttribute("role", "listbox");

    matches.forEach((item) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.innerHTML = `<strong>${item.street}</strong><br><span class="ac-sub">${item.city} · ${item.zip}</span>`;
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onSelect(item);
        input.value = item.label;
        closeDropdown();
      });
      dropdown.appendChild(li);
    });

    input.parentElement.appendChild(dropdown);
  }

  function showStatus(message) {
    closeDropdown();
    dropdown = document.createElement("ul");
    dropdown.className = "mock-autocomplete-list";
    const li = document.createElement("li");
    li.className = "autocomplete-status";
    li.textContent = message;
    dropdown.appendChild(li);
    input.parentElement.appendChild(dropdown);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 1) {
      closeDropdown();
      return;
    }

    const matches = searchIsraelMockAddresses(q, 12);
    openDropdown(matches);
  });

  input.addEventListener("focus", () => {
    const q = input.value.trim();
    if (q.length >= 1) {
      openDropdown(searchIsraelMockAddresses(q, 12));
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(closeDropdown, 150);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });
}

/**
 * Auto-fill city field when user picks from city datalist or types exact city name.
 */
export function initCityAutocomplete(cityInput, onCitySelect) {
  cityInput.addEventListener("input", () => {
    const q = cityInput.value.trim();
    if (q.length < 2) return;

    const matches = getAddressesByCity(q);
    if (matches.length === 1) {
      onCitySelect(matches[0]);
    } else if (matches.length > 1 && matches[0].city.toLowerCase() === q.toLowerCase()) {
      onCitySelect(matches[0]);
    }
  });
}
