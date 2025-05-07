import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID('4')
  parentId?: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID('4', { each: true })
  chidren?: string[];
}
