declare module 'expo-clipboard' {
  /**
   * Read the current string from the system clipboard.
   * Returns null if clipboard is empty.
   */
  export function getStringAsync(): Promise<string | null>;

  /**
   * Write the provided string to the system clipboard.
   */
  export function setStringAsync(value: string): Promise<void>;

  const Clipboard: {
    getStringAsync: typeof getStringAsync;
    setStringAsync: typeof setStringAsync;
  };

  export default Clipboard;
}

// Provide a global fallback for older imports that reference a plain Clipboard global
declare const Clipboard: {
  getStringAsync(value?: string): Promise<string | null>;
  setStringAsync(value: string): Promise<void>;
};

