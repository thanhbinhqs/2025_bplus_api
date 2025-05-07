import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { ALLOW_ANONYMOUS } from '../decorators/allow-anonymous';
import { Utils } from '../helpers/utils';
import { Permission } from 'src/user/entities/permission.entity';
import { Role } from 'src/user/entities/role.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly dbSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = Utils.extractToken(request);
    const allowAnonymous = this.reflector.get<boolean>(
      ALLOW_ANONYMOUS,
      context.getHandler(),
    );

    if (!token) {
      if (allowAnonymous) return true;
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';
      const decoded = jwt.verify(token, jwtSecret);
      const user = await this.dbSource.manager.findOne(User, {
        where: {
          id: decoded['id'],
          deleted: false,
        },
        relations: ['roles.permissions', 'permissions'],
      });

      if (!user) {
        if (allowAnonymous) return true;
        throw new UnauthorizedException('User not found or deleted');
      }

      if (!user.tokens.some((t) => t == token)) {
        if (allowAnonymous) return true;
        throw new UnauthorizedException('Token is invalid with db');
      }
      if (!user.active) {
        if (allowAnonymous) return true;
        throw new UnauthorizedException('User is not active');
      }

      const rolePermissions = user.roles.reduce(
        (acc: Permission[], role: Role) => {
          if (role.permissions) {
            role.permissions.forEach((permission) => {
              if (!acc.some((p: Permission) => p.id === permission.id)) {
                acc.push(permission);
              }
            });
          }
          return acc;
        },
        [],
      );
      const allPermissions = [...user.permissions, ...rolePermissions];
      user.roles = [];
      user.permissions = allPermissions;
      request.user = user;
      return true;
    } catch (err) {
      if (allowAnonymous) return true;
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Authentication token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Authentication token is invalid');
      }
      if (err.name === 'NotBeforeError') {
        throw new UnauthorizedException(
          'Authentication token is not active yet',
        );
      }

      // Handle other JWT errors if necessary
      throw new UnauthorizedException('Authentication token is invalid');
    }
  }
}
