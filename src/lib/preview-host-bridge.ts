export function collectRoutePathsFromTree(_tree?: unknown): string[] {
  return ["/", "/request", "/status", "/admin", "/display"];
}

export function installPreviewHostBridge(_opts?: {
  navigate?: (path: string) => void;
  getRoutePaths?: () => string[];
}): () => void {
  return () => {};
}
