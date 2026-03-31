const API_BASE = "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Đã xảy ra lỗi" }));
    throw new Error(err.detail || err.message || "Đã xảy ra lỗi");
  }
  return res.json();
}

export interface TrashLog {
  label: string;
  confidence: number;
  imageUrl: string;
  thrownAt: string;
}

export const api = {
  register: (data: { fullName: string; email: string; password: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string } | string>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTrashLogs: (limit = 10) =>
    request<{ data: TrashLog[] }>(`/api/trash-logs?limit=${limit}`),
};
