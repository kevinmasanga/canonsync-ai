// lib/validators.js

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
  // At least 8 chars, one letter, one number — adjust to match backend rules
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

export function passwordsMatch(password, confirm) {
  return password === confirm && password.length > 0;
}

export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isNonEmpty(password)) errors.password = "Password is required.";
  return errors;
}

export function validateRegisterForm({ fullName, email, password, confirm }) {
  const errors = {};
  if (!isNonEmpty(fullName)) errors.fullName = "Full name is required.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!isStrongPassword(password)) {
    errors.password = "Password must be at least 8 characters and include a number.";
  }
  if (!passwordsMatch(password, confirm)) errors.confirm = "Passwords don't match.";
  return errors;
}