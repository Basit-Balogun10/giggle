import React, { useMemo, useState, useEffect } from "react";
import type { ConvexReactClient } from "convex/react";

// Safe Convex + Auth provider for mobile.
// This file attempts to dynamically require Convex client and Convex Auth React
// integration when available. When the packages are not installed, it falls back
// to a no-op provider so the app continues to work in dev without Convex.

type Props = {
  children: React.ReactNode;
};

export default function ConvexProvider({ children }: Props) {
  const [ReadyWrapper, setReadyWrapper] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Try to require convex/react and @convex-dev/auth/react in a safe way.
    // If packages are not installed, we keep the no-op wrapper.
    (async () => {
      try {
        // dynamic import for runtime value
        const convexReact = await import("convex/react");
        const {
          ConvexProvider: ConvexReactProvider,
          ConvexReactClient: ConvexClientCtor,
        } = convexReact as any;

        // Determine Convex address from env (VITE_CONVEX_URL or CONVEX_URL) or fallback to localhost dev
        const address =
          (typeof process !== "undefined" &&
            (process.env?.VITE_CONVEX_URL || process.env?.CONVEX_URL)) ||
          "http://localhost:8000";

        // Construct a ConvexReactClient instance
        const client: ConvexReactClient = new ConvexClientCtor(address);

        // Try to import optional auth provider
        let AuthProvider: any = null;
        try {
          const convexAuthReact = await import("@convex-dev/auth/react");
          AuthProvider = convexAuthReact.ConvexAuthProvider || null;
        } catch {
          AuthProvider = null;
        }

        // If an AuthProvider exists, attempt to wire an RN-friendly storage using expo-secure-store
        if (AuthProvider) {
          // try to import SecureStore; if present, create a TokenStorage wrapper
          let storage: any = undefined;
          try {
            const SecureStore = await import("expo-secure-store");
            storage = {
              getItem: (k: string) => SecureStore.getItemAsync(k),
              setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
              removeItem: (k: string) => SecureStore.deleteItemAsync(k),
            };
          } catch {
            // leave storage undefined — the auth provider will fall back to in-memory/localStorage where available
            storage = undefined;
          }

          const Wrapper: React.FC<any> = ({ children: innerChildren }) => (
            <ConvexReactProvider client={client}>
              <AuthProvider client={client} storage={storage}>
                {innerChildren}
              </AuthProvider>
            </ConvexReactProvider>
          );

          // Improve dev ergonomics: provide a displayName for the wrapper
          try {
            Wrapper.displayName = "ConvexAuthWrapper";
          } catch (_) {}

          setReadyWrapper(() => Wrapper);
          return;
        }

        // No auth — provide the convex client directly
        const WrapperNoAuth: React.FC<any> = ({ children: innerChildren }) => (
          <ConvexReactProvider client={client}>
            {innerChildren}
          </ConvexReactProvider>
        );
        try {
          WrapperNoAuth.displayName = "ConvexWrapperNoAuth";
        } catch {}
        setReadyWrapper(() => WrapperNoAuth);
        return;
      } catch {
        // convex/react not installed — keep no-op
      }

      // No-op wrapper
      const NoOp: React.FC<any> = ({ children: c }: any) => <>{c}</>;
      try {
        NoOp.displayName = "ConvexNoOpWrapper";
      } catch (_) {}
      setReadyWrapper(() => NoOp);
    })();
  }, []);

  const Wrapper = useMemo(() => ReadyWrapper, [ReadyWrapper]);

  if (!Wrapper) {
    // Still deciding — render children directly to avoid blocking splash-screen
    return <>{children}</>;
  }

  return <Wrapper>{children}</Wrapper>;
}
