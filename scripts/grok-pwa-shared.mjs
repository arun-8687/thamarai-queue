export function acceptsHtml() { return true; }
export function createHeadInjector() { return (html) => html; }
export function injectGrokPwaHead(html) { return html; }
export function isDocumentPath() { return true; }
export function isInstallQuery() { return false; }
export function renderInstallPageHtml(template) { return template; }
export function renderWebManifest() { return "{}"; }
export function snapshotOgIdentity() { return { site: {} }; }
