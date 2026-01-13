import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";

// Password validation
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 12) {
    return { valid: false, error: "Password must be at least 12 characters" };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one letter" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  if (!SYMBOL_REGEX.test(password)) {
    return { valid: false, error: "Password must contain at least one symbol" };
  }
  return { valid: true };
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
        };
      },
      validatePasswordRequirements: (password: string) => {
        const result = validatePassword(password);
        if (!result.valid) {
          throw new Error(result.error);
        }
      },
    }),
    Google,
  ],
});
