import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Response<T> {
  data: T | null;
  status: 'error' | 'success';
  message: string | null;
}

@Injectable()
export class ResponseParserInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data): Response<T> => ({
        data,
        status: 'success',
        message: null,
      })),
      catchError(error => {
        let message: string;

        if (error instanceof HttpException) {
          message = error.message;
        } else if (error instanceof Error) {
          message = error.message;
        } else {
          message = 'An unexpected error occurred';
        }

        return throwError((): Response<T> => ({
          data: null,
          status: 'error',
          message,
        }));
      }),
    );
  }
}