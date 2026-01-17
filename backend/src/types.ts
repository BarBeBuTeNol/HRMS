export type DbUser = {
  id: number;
  prefix_id: number | null;
  username: string;
  password?: string;     // ใช้เฉพาะ debug เท่านั้น
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role_id: number;
  department_id: number | null;
  department?: string;
};
