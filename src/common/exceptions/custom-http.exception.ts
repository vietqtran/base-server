import { HttpException } from '@nestjs/common';
import { ErrorResponse } from '../interfaces/error-response.interface';

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
      statusCode,
      cause,
    };
    super(response, statusCode);
  }
}
