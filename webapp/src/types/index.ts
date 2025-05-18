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

export interface LogAnalysisReport {
  logs: LogEntry[];
  blacklist_occurance: string[];
  request_counts: Record<string, number>;
  high_frequency_ips: Record<string, number>;
  suspicious_user_agents: any;
  sensitive_endpoint_access: Record<string, number>;
  burst_requests: Record<string, number>;
  user_agent_counts: Record<string, number>;
  status_counts: {
    "2xx": number;
    "3xx": number;
    "4xx": number;
    "5xx": number;
  };
  method_counts: Record<string, number>;
  requests_per_minute: any;
  error_paths: any;
  path_counts: Record<string, number>;
  insights: string[];
  summary: string;
  map_markers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    isp: string;
    request_count: number;
  }>;
}
