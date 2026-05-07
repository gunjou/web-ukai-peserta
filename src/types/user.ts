export interface User {
  id: number;
  name: string;
  email: string;
  role: string;

  mentorships:
    | {
        id: number;
        mentor_id: number;
        mentorship_name: string;
        mentor_name: string;
      }[]
    | null;

  classes: {
    id: number;
    name: string;
    id_batch: number;
    batch: string;
    status_batch: number;
  }[];
}
