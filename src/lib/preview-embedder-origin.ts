export function isGrokEmbedderOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    return host === "grok.com" || host.endsWith(".grok.com") || host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export function isSandboxPreviewGuestHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}

export function resolveParentEmbedderOrigin(): string | null {
  return null;
}
