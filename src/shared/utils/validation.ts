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

