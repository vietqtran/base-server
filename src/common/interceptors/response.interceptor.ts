import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { instanceToPlain as classToPlain } from 'class-transformer';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseParserInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        data: classToPlain(data),
        status: 'success',
        message: null,
      })),
      catchError((error: any) => {
        console.log(error);
        let message: string;

        if (error instanceof HttpException) {
          message = error.message || (error.getResponse() as string);
        } else if (error instanceof Error) {
          message = error.message;
        } else {
          message = 'An unexpected error occurred';
        }

        return throwError(() => ({
          data: null,
          status: 'error',
          message,
        }));
      }),
    );
  }
}