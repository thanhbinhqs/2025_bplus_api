import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindAllDepartmentDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Search by name',
    example: 'department',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
