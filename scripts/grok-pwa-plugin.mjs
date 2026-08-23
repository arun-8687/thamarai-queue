/** Minimal PWA plugin stub — full platform chrome is optional for this app. */
export const GROK_OG_IDENTITY_ID = "virtual:grok-og-identity";

export function grokPwaPlugin() {
  return {
    name: "grok-pwa",
    apply: "serve",
    configureServer() {},
  };
}
