import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FindOneUserDto } from './dto/find-one-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ChangeUserPasswordDto } from './dto/change-password.dto';
import { SetUserPasswordDto } from './dto/set-user-password.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';
import { SetUserPermissionDto } from './dto/set-user-permission.dto';
import { Response } from 'express';
import { SetUserDepartmentDto } from './dto/set-user-department.dto';
import { AllowAnonymous } from 'src/common/decorators/allow-anonymous';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @AllowAnonymous(true)
  me() {
    return this.userService.me();
  }
  
  @Get()
  @ApiConsumes('application/json')
  findAll(@Query() query: FindAllUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() param: FindOneUserDto) {
    return this.userService.findOne(param);
  }

  @Delete(':id')
  remove(@Param() param: DeleteUserDto) {
    return this.userService.delete(param);
  }

  @Patch('change-password')
  changePassword(
    @Body() body: ChangeUserPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.changePassword(body, response);
  }

  @Patch('set-password')
  setPassword(@Body() body: SetUserPasswordDto) {
    return this.userService.setPassword(body);
  }

  @Patch('active')
  setActive(@Body() body: SetUserActiveDto) {
    return this.userService.setActive(body);
  }

  @Patch('role')
  setRole(@Body() body: SetUserRoleDto) {
    return this.userService.setUserRole(body);
  }

  @Patch('permission')
  setPermission(@Body() body: SetUserPermissionDto) {
    return this.userService.setUserPermissions(body);
  }

  @Patch('department')
  setDepartment(@Body() body: SetUserDepartmentDto) {
    return this.userService.setUserDepartments(body);
  }
}
