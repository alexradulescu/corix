// Minimum 12 characters
// At least one letter (a-z, A-Z)
// At least one number (0-9)
// At least one symbol

const SYMBOL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!SYMBOL_REGEX.test(password)) {
    errors.push("Password must contain at least one symbol");
  }

  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < 12) return "weak";

  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (SYMBOL_REGEX.test(password)) score++;
  if (password.length >= 16) score++;

  if (score >= 4) return "strong";
  if (score >= 3) return "medium";
  return "weak";
}
