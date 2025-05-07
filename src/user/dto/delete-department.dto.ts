import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
