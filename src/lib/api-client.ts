import { handleSessionInvalid } from "./session-handler";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...restOptions } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...restOptions,

    headers: {
      "Content-Type": "application/json",

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    // HANDLE SESSION INVALID
    if (error?.message.includes("session invalid")) {
      handleSessionInvalid();
    }

    throw new Error(error?.message || "Terjadi kesalahan");
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "GET",
      ...options,
    }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: "DELETE",
      ...options,
    }),
};
