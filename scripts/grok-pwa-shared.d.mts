export function acceptsHtml(accept?: string): boolean;
export function createHeadInjector(): (html: string) => string;
export function injectGrokPwaHead(html: string): string;
export function isDocumentPath(path: string): boolean;
export function isInstallQuery(url: string): boolean;
export function renderInstallPageHtml(template: string, ctx: { host?: string; url?: string }): string;
export function renderWebManifest(host?: string): string;
export function snapshotOgIdentity(): { site: Record<string, string> };
