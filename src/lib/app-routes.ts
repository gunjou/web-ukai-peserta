export const APP_ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/dashboard/modul-materi",

  TRYOUT: {
    LIST: "/dashboard/tryout",
    ARREARS: "/tryout/tunggakan",
    DETAIL: (id: number) => `/tryout/${id}`,
    ATTEMPT: (id: number) => `/tryout/${id}/attempt`,
    RESULT: (id: number) => `/tryout/${id}/result`,
    HASIL_DETAIL: (token: string) => `/dashboard/hasil/${token}`,
  },
};
