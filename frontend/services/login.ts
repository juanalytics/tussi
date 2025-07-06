// src/services/login.ts
const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL as string;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  // …otros campos si los hay
}

export async function loginUser(
  creds: LoginCredentials
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: creds.username,
      password: creds.password,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }

  return res.json();
}
