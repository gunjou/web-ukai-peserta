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
}
