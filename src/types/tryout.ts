// types/tryout.ts
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

export interface TryoutResponse {
  status: string;
  message: string;
  data: Tryout[];
}

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
