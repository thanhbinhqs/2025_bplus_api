import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/regsiter-user.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Response } from 'express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(body, response);
  }

  @Get('logout')
  logout(
    @Query() query: LogoutDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(query, response);
  }

  @Get('seed')
  seed() {
    return this.authService.seed();
  }
}
