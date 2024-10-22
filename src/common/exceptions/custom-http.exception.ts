import { HttpException, HttpStatus } from '@nestjs/common';

interface ErrorResponse {
  data: null;
  status: 'error';
  message: string;
  cause?: Record<string, any>;
}

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    cause?: Record<string, any>,
  ) {
    const response: ErrorResponse = {
      data: null,
      status: 'error',
      message,
      cause,
    };
    super(response, statusCode);
  }
}
