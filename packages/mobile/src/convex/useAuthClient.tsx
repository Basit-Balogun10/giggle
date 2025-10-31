import React, { createContext, useContext, useEffect, useState } from "react";

// Convex-backed auth adapter for mobile.
// This version requires `@convex-dev/auth/react` to be installed and will
// delegate auth to the Convex Auth React hooks. There is no dev fallback.

const STORAGE_KEY = "giggle_auth_token_v1";

type User = { id: string } | null;

type AuthContextShape = {
  user: User;
  loading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  token?: string | null;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

async function tryImportSecureStore() {
  try {
    const mod = await import("expo-secure-store");
    return mod as typeof import("expo-secure-store");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const convexAuth = await import("@convex-dev/auth/react");
        // If available, try to read session/token helper
        if (
          convexAuth &&
          typeof (convexAuth as any).getSession === "function"
        ) {
          const sess = await (convexAuth as any).getSession();
          if (sess && sess.token) {
            setToken(sess.token);
            if (sess.userId) setUser({ id: sess.userId });
          }
        }
      } catch (err) {
        // Convex auth must be installed for production use.
        // Surface a helpful error so maintainers can install/configure it.

        console.error(
          "Missing @convex-dev/auth/react. Install and configure Convex Auth to enable auth."
        );
        throw err;
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Convex-backed implementations
  async function sendOtp(phone: string) {
    try {
      const convexAuth = await import('@convex-dev/auth/react');
      if (convexAuth && typeof (convexAuth as any).signIn === 'function') {
        await (convexAuth as any).signIn({ phone });
        return;
      }
      throw new Error('Convex Auth signIn not available');
    } catch (err) {
      console.error('sendOtp: Convex Auth not available or failed', err);
      throw err;
    }
  }

  async function verifyOtp(code: string) {
    const convexAuth = await import("@convex-dev/auth/react");
    if (!convexAuth || typeof (convexAuth as any).verify !== "function") {
      throw new Error(
        "Convex Auth verify not available. Ensure @convex-dev/auth/react is installed and up to date."
      );
    }
    const result = await (convexAuth as any).verify(code);
    if (result && result.token) {
      setToken(result.token);
    }
    if (result && result.userId) setUser({ id: result.userId });
  }

  async function signOut() {
    const convexAuth = await import("@convex-dev/auth/react");
    if (!convexAuth || typeof (convexAuth as any).signOut !== "function") {
      throw new Error(
        "Convex Auth signOut not available. Ensure @convex-dev/auth/react is installed and up to date."
      );
    }
    await (convexAuth as any).signOut();
    setUser(null);
    setToken(null);
  }

  const value: AuthContextShape = {
    user,
    loading,
    sendOtp,
    verifyOtp,
    signOut,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthClient() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthClient must be used inside AuthProvider");
  return ctx;
}
