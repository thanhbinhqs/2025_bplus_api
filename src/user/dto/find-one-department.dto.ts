import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindOneDepartmentDto {
  @ApiProperty({
    description: 'Department ID',
    example: 'f3c4e2b0-5c2d-4f3a-8d2e-1a2b3c4d5e6f',
  })
  @IsUUID('4')
  id: string;
}
