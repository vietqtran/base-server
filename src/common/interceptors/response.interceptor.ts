import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseParserInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    let language = request.headers['response-language'];
    if (Array.isArray(language)) {
      language = language[0];
    }
    const i18n = I18nContext.current();
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        return {
          data,
          status: 'success',
          message: null,
          statusCode,
        };
      }),
      catchError(async (error: any) => {
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
          cause = this.transCause(response.cause, i18n, language);
        } else if (error instanceof Error) {
          message = error.message;
        }

        const httpResponse = context.switchToHttp().getResponse<Response>();
        httpResponse.status(statusCode);

        return Promise.resolve({
          data: null,
          status: 'error',
          message,
          statusCode,
          cause,
        });
      }),
    );
  }

  transCause(cause: any, i18n: I18nContext, lang: string) {
    console.log('cause', cause);
    const field = i18n.t(`messages.common.fields.${cause.field}`, { lang });
    return {
      field,
      message: i18n.t(`messages.common.errors.${cause.message}`, {
        lang,
        args: {
          field,
        },
      }),
    };
  }
}
