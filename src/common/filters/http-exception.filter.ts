import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  data: null;
  status: 'error';
  message: string;
  cause?: Record<string, any>;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    this.logger.error(
      `HttpException caught: ${exception.message}`,
      exception.stack,
    );

    const errorResponse: ErrorResponse = {
      data: null,
      status: 'error',
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'An error occurred',
      cause: exceptionResponse.cause,
    };

    response.status(statusCode).json(errorResponse);
  }
}
