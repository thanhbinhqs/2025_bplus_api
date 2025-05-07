import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FindAllDepartmentDto } from './dto/find-all-department.dto';
import { FindOneDepartmentDto } from './dto/find-one-department.dto';
import { DeleteDepartmentDto } from './dto/delete-department.dto';

@Controller('department')
@UseGuards(AuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(@Body() body: CreateDepartmentDto) {
    return this.departmentService.create(body);
  }

  @Get()
  async findAll(@Query() query: FindAllDepartmentDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param() param: FindOneDepartmentDto) {
    return this.departmentService.findOne(param);
  }

  @Put()
  async update(@Body() body: UpdateDepartmentDto) {
    return this.departmentService.update(body);
  }

  @Delete(':id')
  async remove(@Param() param: DeleteDepartmentDto) {
    return this.departmentService.delete(param);
  }
}
