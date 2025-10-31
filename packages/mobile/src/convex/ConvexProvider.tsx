import React from 'react';
import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import * as SecureStore from 'expo-secure-store';

type Props = { children: React.ReactNode };

// Static, explicit Convex provider wiring for mobile. This replaces the previous
// dynamic imports with stable static imports (packages already listed in mobile package.json).
export default function ConvexProvider({ children }: Props) {
  const address = (typeof process !== 'undefined' && (process.env?.VITE_CONVEX_URL || process.env?.CONVEX_URL)) || 'http://localhost:8000';
  // eslint-disable-next-line new-cap
  const client = new ConvexReactClient(address as any);

  // Token storage adapter for Convex Auth using expo-secure-store
  const storage = {
    getItem: (k: string) => SecureStore.getItemAsync(k),
    setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
    removeItem: (k: string) => SecureStore.deleteItemAsync(k),
  };

  const Wrapper: React.FC<any> = ({ children: inner }) => (
    <ConvexReactProvider client={client}>
      <ConvexAuthProvider client={client} storage={storage}>{inner}</ConvexAuthProvider>
    </ConvexReactProvider>
  );

  return <Wrapper>{children}</Wrapper>;
}
