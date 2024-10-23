export interface ErrorResponse {
  data: null;
  status: 'error';
  message: string;
  statusCode: number;
  cause?: Record<string, any>;
}
