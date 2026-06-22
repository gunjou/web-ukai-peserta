// services/tryout.service.ts
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  StartTryoutResponse,
  TryoutAttempt,
  TryoutResponse,
  SubmitAttemptResponse,
  TryoutResultsResponse,
  TryoutReportResponse,
  AnswersMap,
  SaveAnswersRequest,
} from "@/types/tryout";

/* ========== TRYOUT LIST ========== */

/* GET TRYOUT LIST */
export async function getTryouts(token: string) {
  return apiClient.get<TryoutResponse>(API_ENDPOINTS.TRYOUT.LIST, {
    token,
  });
}

/* ========== START & ATTEMPT ========== */

/* START TRYOUT */
export async function startTryout(tryoutId: number, token: string) {
  return apiClient.post<StartTryoutResponse>(
    API_ENDPOINTS.TRYOUT.START(tryoutId),
    {},
    {
      token,
    }
  );
}

/* GET ATTEMPT (QUESTIONS) */
export async function getTryoutAttempt(attemptToken: string, token: string) {
  return apiClient.get<{ data: TryoutAttempt }>(
    API_ENDPOINTS.TRYOUT.ATTEMPT(attemptToken),
    {
      token,
    }
  );
}

/* RESUME ATTEMPT */
export async function resumeAttempt(attemptToken: string, token: string) {
  return apiClient.get<{ data: TryoutAttempt }>(
    API_ENDPOINTS.TRYOUT.RESUME(attemptToken),
    {
      token,
    }
  );
}

/* ========== ANSWERS ========== */

/* SAVE ANSWERS (AUTO-SAVE) */
export async function saveAttemptAnswers(
  attemptToken: string,
  answers: AnswersMap,
  token: string
) {
  const payload: SaveAnswersRequest = { answers };
  return apiClient.put<{ data: Record<string, never> }>(
    API_ENDPOINTS.TRYOUT.ANSWERS(attemptToken),
    payload,
    {
      token,
    }
  );
}

/* ========== SUBMIT ========== */

/* SUBMIT ATTEMPT */
export async function submitAttempt(attemptToken: string, token: string) {
  return apiClient.post<SubmitAttemptResponse>(
    API_ENDPOINTS.TRYOUT.SUBMIT(attemptToken),
    {},
    {
      token,
    }
  );
}

/* ========== RESULTS & REPORT ========== */

/* GET TRYOUT RESULTS (HISTORY) */
export async function getTryoutResults(token: string) {
  return apiClient.get<TryoutResultsResponse>(API_ENDPOINTS.TRYOUT.RESULTS, {
    token,
  });
}

/* GET TRYOUT REPORT (REVIEW) */
export async function getTryoutReport(attemptToken: string, token: string) {
  return apiClient.get<TryoutReportResponse>(
    API_ENDPOINTS.TRYOUT.REPORT(attemptToken),
    {
      token,
    }
  );
}
