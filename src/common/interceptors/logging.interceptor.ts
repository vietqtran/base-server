import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { body, params, query } = req;

    console.log('------------------------------------------------');
    console.log('Request URL:', req.url);
    console.log('Method:', req.method);
    console.log('Request:');
    console.log('Body:', body);
    console.log('Params:', params);
    console.log('Query:', query);

    const now = Date.now();
    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - now;
        console.log('Response:');
        console.log('Data:', response);
        console.log(`Response time: ${responseTime}ms`);
      }),
    );
  }
}
