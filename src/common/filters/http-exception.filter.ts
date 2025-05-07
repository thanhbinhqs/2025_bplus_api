import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  /**
   * This method is called when an exception is thrown.
   * @param exception The exception that was thrown.
   * @param host The context of the request.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest();

    //check if exception is instance of HttpException ==> response internal server error
    if (!(exception instanceof HttpException)) {
      exception = new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
     const m = exception.getResponse()

    const errorResponse = {
      success: false,
      status: 'error',
      statusCode: status,
      name: exception.name,
      timestamp: new Date().toISOString(),
      // thêm thông tin nếu đang trong môi trường dev
      ...(process.env.NODE_ENV === 'development'
        ? {
            stack: exception.stack,
            error: exception.getResponse(),
          }
        : {}),
      path: request.url,
      message: exception.getResponse()['message'] || null,
    };
    // Log the error
    //get client ip address
    const clientIp = request.headers['x-forwarded-for'];
    this.logger.error(
      `${clientIp || 'localhost'} ${request.method} ${request.url} ${status}`, // Log the request method and URL
    );
    response.status(status).json(errorResponse);
  }
}
