import { api } from "../lib/api";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  user: AuthUser;
}

// Logowanie użytkownika
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}

// Pobieranie danych użytkownika
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/users/me");

  return response.data;
}

// Wylogowanie użytkownika
export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}
