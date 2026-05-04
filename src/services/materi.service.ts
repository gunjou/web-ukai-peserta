import { apiClient } from "../lib/api-client";

import { API_ENDPOINTS } from "../lib/endpoints";

export interface Materi {
  id: number;

  id_modul: number;

  type: string;

  title: string;

  url: string;

  is_downloadable: number;
}

interface MateriResponse {
  status: string;

  message: string;

  data: Materi[];
}

export async function getMateriByModul(
  modulId: string,
  type: "document" | "video",
  token: string,
) {
  return apiClient.get<MateriResponse>(
    API_ENDPOINTS.MATERI.BY_MODUL(modulId, type),
    {
      token,
    },
  );
}
