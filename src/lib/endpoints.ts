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
};
