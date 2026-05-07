import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { User } from "@/types/user";

interface MeResponse {
  status: string;
  message: string;
  data: User;
}

export async function getMe(token: string) {
  return apiClient.get<MeResponse>(API_ENDPOINTS.USER.ME, { token });
}

export async function changePassword(
  data: { old_password: string; new_password: string },
  token: string,
) {
  return apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data, { token });
}
