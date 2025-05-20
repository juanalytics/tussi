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

export async function fetchUserProfile(): Promise<any> {
  const token = localStorage.getItem("token")

  if (!token) throw new Error("No token found")

  const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Failed to fetch user profile")
  }

  return res.json()
}