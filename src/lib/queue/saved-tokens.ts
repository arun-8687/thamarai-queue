const KEY = "thamarai_saved_tokens";

export type SavedToken = {
  tokenNo: string;
  branchId: string;
  last4: string;
  guestLabel: string;
  createdAt: string;
};

export function readSavedTokens(): SavedToken[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedToken[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function rememberToken(token: SavedToken) {
  const next = [token, ...readSavedTokens().filter((t) => t.tokenNo !== token.tokenNo)].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(next));
}
