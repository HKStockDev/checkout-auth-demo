/** Checkout field validation */

export function validateName(value) {
  return value.trim().length >= 2;
}

export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits.length >= 11 && digits.length <= 12;
  return digits.length >= 9 && digits.length <= 10;
}

export function validateCardName(value) {
  return value.trim().length >= 2;
}

export function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export function luhnCheck(cardNumber) {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(value) {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;
  return luhnCheck(digits);
}

export function validateExpiry(value) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiryEnd = new Date(year, month, 0, 23, 59, 59);
  return expiryEnd >= now;
}

export function validateCvv(value) {
  return /^\d{3,4}$/.test(value.trim());
}

const FIELD_RULES = {
  name: {
    validate: validateName,
    message: "Enter your full name (at least 2 characters).",
  },
  email: {
    validate: validateEmail,
    message: "Enter a valid email address.",
  },
  phone: {
    validate: validatePhone,
    message: "Enter a valid phone number (9-10 digits).",
  },
  "card-name": {
    validate: validateCardName,
    message: "Enter the name on your card.",
  },
  "card-number": {
    validate: validateCardNumber,
    message: "Enter a valid card number (13-19 digits).",
  },
  "card-expiry": {
    validate: validateExpiry,
    message: "Enter a valid expiry date (MM/YY, not expired).",
  },
  "card-cvv": {
    validate: validateCvv,
    message: "Enter a valid CVV (3 or 4 digits).",
  },
};

export function validateField(fieldId, value) {
  const rule = FIELD_RULES[fieldId];
  if (!rule) return { valid: true, message: "" };
  const valid = rule.validate(value);
  return { valid, message: valid ? "" : rule.message };
}

export function getCheckoutFormValues(form) {
  return {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    "card-name": form["card-name"].value,
    "card-number": form["card-number"].value,
    "card-expiry": form["card-expiry"].value,
    "card-cvv": form["card-cvv"].value,
  };
}

export function validateCheckoutForm(form) {
  const values = getCheckoutFormValues(form);
  const fields = {};
  let valid = true;

  for (const [id, value] of Object.entries(values)) {
    const result = validateField(id, value);
    fields[id] = result;
    if (!result.valid) valid = false;
  }

  return { valid, fields, values };
}

export function formatCardNumberInput(value) {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiryInput(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
