export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  uptime: number;
  timestamp: string;
}

export interface WelcomeResponse {
  message: string;
  status: string;
  timestamp: string;
}