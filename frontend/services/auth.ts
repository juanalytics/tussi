// src/services/auth.ts

const AUTH_API = "http://localhost:8000"

export interface UserCreate {
  email: string
  password: string
  first_name: string
  last_name?: string
  locale?: string
  timezone?: string
  marketing_consent?: boolean
}

export async function registerUser(data: UserCreate) {
  const res = await fetch(`${AUTH_API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(payload.detail || payload.message || "Registration failed")
  }
  return payload
}
