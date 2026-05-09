export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string>;
}
