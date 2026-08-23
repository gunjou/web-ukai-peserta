import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/endpoints";

export interface Modul {
  id: number;
  title: string;
  progress?: {
    total_materi: number;
    materi_dibuka: number;
    materi_belum_dibuka: number;
    progress_percentage: number;
  };
}

interface ModulResponse {
  status: string;
  message: string;
  data: Modul[];
}

export async function getModulPeserta(token: string) {
  return apiClient.get<ModulResponse>(API_ENDPOINTS.MODUL.MODUL_PESERTA, {
    token,
  });
}
