import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContentTypeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Bỏ qua kiểm tra nếu route bắt đầu bằng /api/docs
    if (req.path.startsWith('/api/docs') || req.path.startsWith("/api/upload")) {
      return next();
    }

    // Kiểm tra Content-Type
    if (req.body && req.headers['content-type'] !== 'application/json') {
      throw new BadRequestException('Content-Type must be application/json');
    }

    next();
  }
}