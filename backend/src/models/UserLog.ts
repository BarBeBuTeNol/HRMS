export interface UserLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  created_at: string;
  ip_address?: string;
  severity?: 'Info' | 'Warning' | 'Critical';
  target?: string;
  change_request_id?: number;
}
