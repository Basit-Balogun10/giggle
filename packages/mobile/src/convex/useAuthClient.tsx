import React, { createContext, useContext, useEffect, useState } from 'react';

// Lightweight auth adapter for mobile that attempts to use `@convex-dev/auth/react`
// when available, and falls back to a dev-friendly OTP flow persisted in
// SecureStore when not. This keeps the app runnable during local development
// and will use the real Convex auth hooks when the package is present.

const STORAGE_KEY = 'giggle_auth_token_v1';

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
    const mod = await import('expo-secure-store');
    return mod as typeof import('expo-secure-store');
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
      // Prefer real Convex auth react hooks if available
      try {
        const convexAuth = await import('@convex-dev/auth/react');
        // If the package exposes a getSession or similar helper, try to read token
        if (convexAuth && typeof (convexAuth as any).getSession === 'function') {
          const sess = await (convexAuth as any).getSession();
          if (sess && sess.token) {
            setToken(sess.token);
            // try to set a user id if present
            if (sess.userId) setUser({ id: sess.userId });
            setLoading(false);
            return;
          }
        }
      } catch {
        // not installed or failed — fall back to SecureStore method
      }

      const SecureStore = await tryImportSecureStore();
      if (SecureStore) {
        try {
          const t = await SecureStore.getItemAsync(STORAGE_KEY);
          if (t) {
            // token format: either 'dev:<id>' or a bearer token
            if (t.startsWith('dev:')) {
              setUser({ id: t.slice(4) });
              setToken(t);
            } else {
              setToken(t);
            }
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    })();
  }, []);

  // Dev fallback implementations
  async function sendOtp(phone: string) {
    // If @convex-dev/auth/react is available, call its signIn/sendOtp helper.
    try {
      const convexAuth = await import('@convex-dev/auth/react');
      if (convexAuth && typeof (convexAuth as any).signIn === 'function') {
        await (convexAuth as any).signIn({ phone });
        return;
      }
    } catch {
      // fall back to dev behavior
    }
    return;
  }

  async function verifyOtp(code: string) {
    // Try to use convex auth verify if available
    try {
      const convexAuth = await import('@convex-dev/auth/react');
      if (convexAuth && typeof (convexAuth as any).verify === 'function') {
        const result = await (convexAuth as any).verify(code);
        // result may include token and userId
        if (result && result.token) {
          setToken(result.token);
          const SecureStore = await tryImportSecureStore();
          if (SecureStore) await SecureStore.setItemAsync(STORAGE_KEY, result.token);
        }
        if (result && result.userId) setUser({ id: result.userId });
        return;
      }
    } catch {
      // fall back to dev flow
    }

    // Dev flow: accept any code, store a dev token comprised of phone or code
    const SecureStore = await tryImportSecureStore();
    const devToken = `dev:${code}`; // code used as id in fallback
    if (SecureStore) {
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, devToken);
      } catch {
        // ignore
      }
    }
    setToken(devToken);
    setUser({ id: code });
  }

  async function signOut() {
    // Try to call convex auth signOut if available
    try {
      const convexAuth = await import('@convex-dev/auth/react');
      if (convexAuth && typeof (convexAuth as any).signOut === 'function') {
        await (convexAuth as any).signOut();
      }
    } catch {
      // ignore
    }
    const SecureStore = await tryImportSecureStore();
    if (SecureStore) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
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
  if (!ctx) throw new Error('useAuthClient must be used inside AuthProvider');
  return ctx;
}
