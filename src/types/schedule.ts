export type MeetingType = "online" | "offline";

export interface Schedule {
  id: number;
  date: string;
  name: string;
  start_time: string;
  end_time: string;
  meeting_type: MeetingType;
  mentor?: string;
  location?: string;
  id_paketkelas?: number;
  id_mentor?: number;
  nickname_mentor?: string;
  original_date?: string;
  original_start_time?: string;
  original_end_time?: string;
}

export interface ScheduleApiItem {
  id_jadwal: number;
  id_paketkelas: number;
  nama_kelas: string;
  id_mentor: number;
  nama_mentor: string;
  nickname_mentor: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tanggal_reschedule: string | null;
  waktu_mulai_reschedule: string | null;
  waktu_selesai_reschedule: string | null;
  tanggal_efektif: string;
  waktu_mulai_efektif: string;
  waktu_selesai_efektif: string;
  type_pertemuan: string;
}

export type ScheduleDetail = ScheduleApiItem;

export interface AttendanceStatus {
  id_absensi_peserta: number;
  id_jadwal: number;
  status_kehadiran: string | null;
  check_in_at: string | null;
  sudah_absen: boolean;
}
