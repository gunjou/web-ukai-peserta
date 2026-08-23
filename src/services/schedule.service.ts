import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type {
  AttendanceStatus,
  ScheduleApiItem,
  ScheduleDetail,
} from "@/types/schedule";

interface ScheduleListResponse {
  status: string;
  message: string;
  data: ScheduleApiItem[];
}

interface ScheduleDetailResponse {
  status: string;
  message: string;
  data: ScheduleDetail;
}

interface AttendanceResponse {
  status: string;
  message: string;
  data: AttendanceStatus;
}

export interface CheckInPayload {
  id_jadwal: number;
  latitude: number;
  location_accuracy: number;
  longitude: number;
}

export function toSchedule(item: ScheduleApiItem) {
  return {
    id: item.id_jadwal,
    date: item.tanggal_efektif,
    name: item.nama_kelas,
    start_time: item.waktu_mulai_efektif.slice(0, 5),
    end_time: item.waktu_selesai_efektif.slice(0, 5),
    meeting_type:
      item.type_pertemuan.toLowerCase() === "online" ? "online" : "offline",
    topik: item.topik,
    catatan: item.catatan,
    mentor: item.nickname_mentor || item.nama_mentor,
    location:
      item.type_pertemuan.toLowerCase() === "online"
        ? "Pertemuan online"
        : "Offline",
    id_paketkelas: item.id_paketkelas,
    id_mentor: item.id_mentor,
    nickname_mentor: item.nickname_mentor,
    original_date: item.tanggal,
    original_start_time: item.waktu_mulai,
    original_end_time: item.waktu_selesai,
  } as const;
}

export async function getSchedules(token: string) {
  return apiClient.get<ScheduleListResponse>(API_ENDPOINTS.SCHEDULE.LIST, {
    token,
  });
}

export async function getScheduleDetail(scheduleId: number, token: string) {
  return apiClient.get<ScheduleDetailResponse>(
    API_ENDPOINTS.SCHEDULE.DETAIL(scheduleId),
    { token }
  );
}

export async function getAttendanceStatus(scheduleId: number, token: string) {
  return apiClient.get<AttendanceResponse>(
    API_ENDPOINTS.SCHEDULE.ATTENDANCE(scheduleId),
    { token }
  );
}

export async function checkIn(payload: CheckInPayload, token: string) {
  return apiClient.post<{ status: string; message: string }>(
    API_ENDPOINTS.SCHEDULE.CHECK_IN,
    payload,
    { token }
  );
}
