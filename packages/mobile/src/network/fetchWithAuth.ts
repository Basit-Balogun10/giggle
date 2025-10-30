const STORAGE_KEY = 'giggle_auth_token_v1';

async function tryImportSecureStore() {
  try {
    const mod = await import('expo-secure-store');
    return mod as typeof import('expo-secure-store');
  } catch {
    return null;
  }
}

export default async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const SecureStore = await tryImportSecureStore();
  let token: string | null = null;
  if (SecureStore) {
    try {
      token = await SecureStore.getItemAsync(STORAGE_KEY);
    } catch {
      token = null;
    }
  }

  const headers = new Headers(init?.headers as any);

  if (token) {
    if (token.startsWith('dev:')) {
      headers.set('x-user-id', token.slice(4));
    } else {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const finalInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, finalInit);
}
