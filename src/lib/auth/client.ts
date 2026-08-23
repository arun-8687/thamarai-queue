export const authClient = {
  useSession: () => ({ data: null, isPending: false }),
  signIn: { social: async () => ({}) },
  signOut: async () => ({}),
};
