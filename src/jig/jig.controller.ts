import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JigService } from './jig.service';
import { CreateJigDto } from './dto/create-jig.dto';
import { UpdateJigDto } from './dto/update-jig.dto';

@Controller('jig')
export class JigController {
  constructor(private readonly jigService: JigService) {}

  @Post()
  create(@Body() createJigDto: CreateJigDto) {
    return this.jigService.create(createJigDto);
  }

  @Get()
  findAll() {
    return this.jigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jigService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJigDto: UpdateJigDto) {
    return this.jigService.update(+id, updateJigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jigService.remove(+id);
  }
}
