/**
 * Validates an email address format
 * RFC 5322 compliant basic email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates email and returns an error message if invalid
 */
export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return "Email is required";
  }

  if (!isValidEmail(trimmedEmail)) {
    return "Please enter a valid email address";
  }

  return null;
}

/**
 * Validates password strength according to spec:
 * - Minimum 12 characters
 * - At least one letter (a-z, A-Z)
 * - At least one number (0-9)
 * - At least one symbol
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
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
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one symbol");
  }

  return { valid: errors.length === 0, errors };
}
