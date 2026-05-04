import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/endpoints";

export interface LoginPayload {
  email: string;

  password: string;

  platform: string;
}

export interface LoginResponse {
  status: string;

  message: string;

  data: {
    access_token: string;

    refresh_token: string;
  };
}

export async function login(payload: LoginPayload) {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
}
