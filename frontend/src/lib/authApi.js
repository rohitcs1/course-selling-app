import { config } from "../config";

export async function adminLogin(username, password) {
  const response = await fetch(`${config.apiBaseUrl}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Login failed");
  }

  return data.token;
}

export async function adminLogout(token) {
  const response = await fetch(`${config.apiBaseUrl}/api/admin/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}
