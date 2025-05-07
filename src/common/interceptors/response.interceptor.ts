import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  //add logger
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const request: Request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const status = response.statusCode;

        const clientIp = request.headers['x-forwarded-for'];
        this.logger.log(
          `${clientIp || 'localhost'} ${request.method} ${request.url} ${status}`, // Log the request method and URL
        );

        return {
          success: true,
          status: 'success',
          statusCode: status,
          data,
        };
      }),
      // ,
      // catchError((error) => {
      //   const response = context.switchToHttp().getResponse();
      //   const status = error.status || 500;

      //   return response.status(status).json({
      //     success: false,
      //     status: 'error',
      //     message: error.message || 'Internal server error',
      //     ...(status === 500 ? { stack: error.stack } : {}),
      //   });
      // }),
    );
  }
}
