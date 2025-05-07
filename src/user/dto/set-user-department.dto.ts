import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetUserDepartmentDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: String, description: 'Department ID' })
  @IsUUID('4', { each: true, message: 'Department ID must be a valid UUID' })
  @IsNotEmpty()
  departmentId: string[];
}
