import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseParserInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        data,
        status: 'success',
        message: null,
      })),
      catchError((error: any) => {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        let cause = undefined;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const response = error.getResponse() as any;
          message =
            typeof response === 'string'
              ? response
              : response.message || message;
          cause = response.cause;
        } else if (error instanceof Error) {
          message = error.message;
        }

        const httpResponse = context.switchToHttp().getResponse<Response>();
        httpResponse.status(statusCode);

        return Promise.resolve({
          data: null,
          status: 'error',
          message,
          cause,
        });
      }),
    );
  }
}
