export async function handleAuthPopupRequest(_req: Request): Promise<Response> {
  return new Response("Auth popup is not used in this app.", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
