import { api } from "./api";

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await api.get<{ csrfToken: string }>("/auth/csrf");

  csrfToken = response.data.csrfToken;

  return csrfToken;
}

export function clearCsrfToken() {
  csrfToken = null;
}
