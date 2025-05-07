import { Injectable } from '@nestjs/common';
import { CreateJigDto } from './dto/create-jig.dto';
import { UpdateJigDto } from './dto/update-jig.dto';

@Injectable()
export class JigService {
  create(createJigDto: CreateJigDto) {
    return 'This action adds a new jig';
  }

  findAll() {
    return `This action returns all jig`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jig`;
  }

  update(id: number, updateJigDto: UpdateJigDto) {
    return `This action updates a #${id} jig`;
  }

  remove(id: number) {
    return `This action removes a #${id} jig`;
  }
}
