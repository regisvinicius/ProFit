const getApiBase = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url || url === "") return "/v1";
  return `${url.replace(/\/$/, "")}/v1`;
};

export async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<Response> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${getApiBase()}${path}`, { ...init, headers });
}
