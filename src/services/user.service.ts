import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserResponse {
  status: string;
  message: string;
  data: User;
}

export async function getMe(token: string) {
  return apiClient.get<UserResponse>(API_ENDPOINTS.USER.ME, { token });
}
