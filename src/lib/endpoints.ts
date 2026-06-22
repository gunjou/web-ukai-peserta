// lib/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v2/auth/login",
    LOGOUT: "/api/v2/auth/logout",
  },

  USER: {
    ME: "/api/v2/user/me",
    CHANGE_PASSWORD: "/api/v2/user/change-password",
  },

  MODUL: {
    MODUL_PESERTA: "/api/v2/modul/peserta",
  },

  MATERI: {
    BY_MODUL: (modulId: string, type: "document" | "video") =>
      `/api/v2/materi/peserta/${modulId}?type=${type}`,
    PRIVATE: (type: "document" | "video") =>
      `/api/v2/materi/peserta/private?type=${type}`,
  },

  TRYOUT: {
    LIST: "/api/v2/tryout/peserta",
    START: (tryoutId: number) => `/api/v2/tryout/${tryoutId}/start`,
    ATTEMPT: (attemptToken: string) => `/api/v2/tryout/attempt/${attemptToken}`,
    ANSWERS: (attemptToken: string) =>
      `/api/v2/tryout/attempt/${attemptToken}/answers`,
    SUBMIT: (attemptToken: string) =>
      `/api/v2/tryout/attempt/${attemptToken}/submit`,
    RESUME: (attemptToken: string) =>
      `/api/v2/tryout/attempt/${attemptToken}/resume`,
    REPORT: (attemptToken: string) => `/api/v2/tryout/report/${attemptToken}`,
    RESULTS: "/api/v2/tryout/report",
  },
};
