// types/tryout.ts

/* ========== TRYOUT LIST & DETAIL ========== */
export interface Tryout {
  id: number;
  title: string;
  total_soal: number;
  duration: number;
  max_attempt: number;
  remaining_attempt: number;
  access_start_at: string;
  access_end_at: string;
  status: "ongoing" | "upcoming" | "closed" | "expired";
}

export interface TryoutResponse {
  status: string;
  message: string;
  data: Tryout[];
}

/* ========== START TRYOUT ========== */
export interface StartTryoutResponse {
  status: string;
  message: string;
  data: {
    attempt_token: string;
    attempt_ke: number;
    duration: number;
    total_soal: number;
    start_time: string;
  };
}

/* ========== QUESTIONS ========== */
export interface TryoutQuestion {
  id: number;
  nomor: number;
  pertanyaan: string;
  pilihan: Record<string, string>;
}

export interface TryoutAttempt {
  attempt_token: string;
  duration: number;
  remaining_time: number;
  questions: TryoutQuestion[];
}

/* ========== ANSWERS ========== */
export interface Answer {
  answer: string | null; // 'A' | 'B' | 'C' | 'D' | 'E' | null
  ragu: boolean;
}

export interface AnswersMap {
  [questionId: number]: Answer;
}

export interface SaveAnswersRequest {
  answers: AnswersMap;
}

/* ========== SUBMIT RESULT ========== */
export interface TryoutResult {
  score: number;
  benar: number;
  salah: number;
  kosong: number;
  ragu_ragu: number;
  attempt_token?: string;
}

export interface SubmitAttemptResponse {
  status: string;
  message: string;
  data: TryoutResult;
}

/* ========== RESULT HISTORY ========== */
export interface TryoutResultItem {
  attempt_token: string;
  title: string;
  score: number;
  benar: number;
  salah: number;
  kosong: number;
  ragu_ragu: number;
  attempt_ke: number;
  tanggal: string;
}

export interface TryoutResultsResponse {
  status: string;
  message: string;
  data: TryoutResultItem[];
}

/* ========== REPORT / REVIEW ========== */
export interface TryoutReportQuestion {
  id: number;
  nomor: number;
  pertanyaan: string;
  pilihan: Record<string, string>;
  correct_answer: string;
  user_answer: string | null;
  status: "benar" | "salah" | "kosong";
  is_ragu: boolean;
  pembahasan: string | null;
}

export interface TryoutReportResponse {
  status: string;
  message: string;
  data: TryoutReportQuestion[];
}

/* ========== SESSION PERSISTENCE ========== */
export interface SessionState {
  tryoutId: number;
  attemptToken: string;
  answers: AnswersMap;
  currentIndex: number;
  endTime: number;
}

/* ========== LEADERBOARD ========== */

export interface LeaderboardSummary {
  total_participants: number;
  total_attempt: number;
  average_score: number;
  highest_score: number;
  my_score: number;
  my_rank: number;
}

export interface LeaderboardItem {
  rank: number;
  user_id: number;
  name: string;
  class: string;
  score: number;
  attempt: number;
  duration: number;
}

export interface LeaderboardData {
  summary: LeaderboardSummary;
  leaderboard: LeaderboardItem[];
}

export interface LeaderboardResponse {
  status: string;
  message: string;
  data: LeaderboardData;
  meta: {
    response_time_us: number;
    timestamp: string;
    request_id: string;
  };
}
export interface OngoingAttempt {
  id_hasiltryout: number;
  id_tryout: number;
  attempt_token: string;
  start_time: string;
  end_time: string | null;
  jawaban_user: Record<string, any>;
  status_pengerjaan: string;
}

export interface OngoingAttemptItem {
  title: string;
  id_hasiltryout: number;
  id_tryout: number;
  attempt_token: string;
  start_time: string;
  end_time: string | null; // null while genuinely ongoing
  jawaban_user:
    | Record<string, { answer: string; ragu: boolean }>
    | Record<
        string,
        { jawaban: string | null; ragu: number; timestamp: string | null }
      >;
  status_pengerjaan: "ongoing";
}

export interface IsOngoingResponse {
  status: string;
  message: string;
  data: {
    ongoing: OngoingAttemptItem[];
    expired: OngoingAttemptItem[];
  };
  meta: {
    response_time_us: number;
    timestamp: string;
    request_id: string;
  };
}
