import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/endpoints";

export interface Modul {
  id: number;
  title: string;
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
