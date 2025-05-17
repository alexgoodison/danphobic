export interface LogEntry {
  remote_addr: string;
  remote_user: string;
  time_local: string;
  request: string;
  status: number;
  body_bytes_sent: number;
  http_referer: string;
  http_user_agent: string;
  datetime: string;
  method: string;
  path: string;
  protocol: string;
}
