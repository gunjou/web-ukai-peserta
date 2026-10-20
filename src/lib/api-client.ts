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

  const isFormData =
    typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...restOptions,

    headers: {
      // FormData harus membiarkan browser mengatur Content-Type dan boundary.
      ...(!isFormData && {
        "Content-Type": "application/json",
      }),

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    if (error?.message?.includes("session invalid")) {
      handleSessionInvalid();
    }

    throw new Error(error?.message || `Terjadi kesalahan (${response.status})`);
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
      body:
        typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
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
