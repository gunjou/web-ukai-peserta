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

const OPENED_MATERI_STORAGE_KEY = "opened_materi_ids";

export function getOpenedMateriIds(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const storedIds = JSON.parse(
      localStorage.getItem(OPENED_MATERI_STORAGE_KEY) ?? "[]"
    );

    return Array.isArray(storedIds)
      ? storedIds.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

function saveOpenedMateriId(materiId: number) {
  const openedIds = new Set(getOpenedMateriIds());
  openedIds.add(materiId);
  localStorage.setItem(
    OPENED_MATERI_STORAGE_KEY,
    JSON.stringify(Array.from(openedIds))
  );
}

export interface MateriProgressModule {
  id_modul: number;
  nama_modul: string;
  total_materi: number;
  materi_dibuka: number;
  materi_belum_dibuka: number;
  progress_percentage: number;
}

export interface MateriProgressMonitoring {
  summary: {
    total_materi: number;
    materi_dibuka: number;
    materi_belum_dibuka: number;
    progress_percentage: number;
  };
  modules: MateriProgressModule[];
}

interface MateriResponse {
  status: string;

  message: string;

  data: Materi[];
}

export async function getMateriByModul(
  modulId: string,
  type: "document" | "video",
  token: string
) {
  return apiClient.get<MateriResponse>(
    API_ENDPOINTS.MATERI.BY_MODUL(modulId, type),
    {
      token,
    }
  );
}

export async function getPrivateMateri(
  type: "document" | "video",
  token: string
) {
  return apiClient.get<{ data: Materi[] }>(API_ENDPOINTS.MATERI.PRIVATE(type), {
    token,
  });
}

export async function getMateriProgressMonitoring(token: string) {
  return apiClient.get<{ data: MateriProgressMonitoring }>(
    API_ENDPOINTS.MATERI.PROGRESS_MONITORING,
    { token }
  );
}

export async function getMateriProgressByType(
  moduleIds: number[],
  type: "document" | "video",
  token: string
) {
  const openedIds = new Set(getOpenedMateriIds());
  const results = await Promise.allSettled(
    moduleIds.map((moduleId) =>
      getMateriByModul(String(moduleId), type, token).then((result) => ({
        moduleId,
        total: result.data.length,
        opened: result.data.filter((materi) => openedIds.has(materi.id)).length,
      }))
    )
  );

  return new Map(
    results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          moduleId: number;
          total: number;
          opened: number;
        }> => result.status === "fulfilled"
      )
      .map(({ value }) => [value.moduleId, value] as const)
  );
}

export async function markMateriAsOpened(materiId: number, token: string) {
  const result = await apiClient.post(
    API_ENDPOINTS.MATERI.PROGRESS(materiId),
    undefined,
    {
      token,
    }
  );
  saveOpenedMateriId(materiId);
  return result;
}
