import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const response = error.getResponse();
          message =
            typeof response === 'string'
              ? response
              : response['message'] || message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        context.switchToHttp().getResponse().status(statusCode);

        return Promise.resolve({
          data: null,
          status: 'error',
          message,
        });
      }),
    );
  }
}
