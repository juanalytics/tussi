// src/services/auth.ts

const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL as string;

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
  const res = await fetch(`${API_BASE}/register`, {
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

  const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/me`, {
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