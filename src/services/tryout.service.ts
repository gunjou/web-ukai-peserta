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
  LeaderboardResponse,
  IsOngoingResponse,
  TryoutArrearsResponse,
} from "@/types/tryout";

/* ========== TRYOUT LIST ========== */

/* GET TRYOUT LIST */
export async function getTryouts(token: string) {
  return apiClient.get<TryoutResponse>(API_ENDPOINTS.TRYOUT.LIST, {
    token,
  });
}

/* GET TRYOUT ARREARS */
export async function getTryoutArrears(token: string) {
  return apiClient.get<TryoutArrearsResponse>(API_ENDPOINTS.TRYOUT.ARREARS, {
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

/* ========== LEADERBOARD ========== */

/* GET TRYOUT LEADERBOARD (PER CLASS) */
export async function getTryoutLeaderboardClass(
  tryoutId: number | string,
  token: string
) {
  return apiClient.get<LeaderboardResponse>(
    API_ENDPOINTS.TRYOUT.LEADERBOARD_CLASS(tryoutId),
    {
      token,
    }
  );
}

/* ========== ONGOING / EXPIRED CHECK ========== */

/* CHECK ONGOING & EXPIRED ATTEMPTS */
export async function checkOngoingTryout(token: string) {
  return apiClient.get<IsOngoingResponse>(API_ENDPOINTS.TRYOUT.IS_ONGOING, {
    token,
  });
}
