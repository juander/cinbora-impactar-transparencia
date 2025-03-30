import Cookies from "js-cookie";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = Cookies.get("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error("Erro na requisição");
  }

  return response.json();
}

