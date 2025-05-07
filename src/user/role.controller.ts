import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleService } from './role.service';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { FindOneRoleDto } from './dto/find-one-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('role')
@UseGuards(AuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: CreateRoleDto) {
    return this.roleService.create(body);
  }

  @Get()
  @ApiConsumes('application/json')
  findAll(@Query() query: FindAllRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() param: FindOneRoleDto) {
    return this.roleService.findOne(param);
  }

  @Put()
  update(@Body() body: UpdateRoleDto) {
    return this.roleService.update(body);
  }

  @Delete(':id')
  remove(@Param() param: DeleteRoleDto) {
    return this.roleService.delete(param);
  }
}
