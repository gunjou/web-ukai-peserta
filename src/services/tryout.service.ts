// services/tryout.service.ts
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  StartTryoutResponse,
  TryoutAttempt,
  TryoutResponse,
} from "@/types/tryout";

/* GET TRYOUT LIST */
export async function getTryouts(token: string) {
  return apiClient.get<TryoutResponse>(API_ENDPOINTS.TRYOUT.LIST, {
    token,
  });
}

/* START TRYOUT */
export async function startTryout(tryoutId: number, token: string) {
  return apiClient.post<StartTryoutResponse>(
    API_ENDPOINTS.TRYOUT.START(tryoutId),
    {},
    {
      token,
    },
  );
}

/* GET ATTEMPT */
export async function getTryoutAttempt(attemptToken: string, token: string) {
  return apiClient.get<{ data: TryoutAttempt }>(
    API_ENDPOINTS.TRYOUT.ATTEMPT(attemptToken),
    {
      token,
    },
  );
}
