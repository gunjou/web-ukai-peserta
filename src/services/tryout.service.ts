import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";

export interface Tryout {
  id: number;
  title: string;
  total_soal: number;
  duration: number;
  max_attempt: number;
  access_start_at: string;
  access_end_at: string;
  status: "ongoing" | "expired" | "upcoming";
}

interface TryoutResponse {
  status: string;
  message: string;
  data: Tryout[];
}

export async function getTryouts(token: string) {
  return apiClient.get<TryoutResponse>(API_ENDPOINTS.TRYOUT.LIST, {
    token,
  });
}
