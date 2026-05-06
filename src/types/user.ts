export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  classes?: {
    id: number;
    name: string;
    id_batch: number;
    batch: string;
    status_batch: number;
  }[];
}
