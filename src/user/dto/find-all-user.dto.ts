import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsNumberString, IsOptional, IsString, Validate } from "class-validator";

export class FindAllUserDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10, required: false })
  @IsNumberString()
  @IsOptional()
  limit: number;

  @ApiProperty({ description: 'Order of sorting', example: 'ASC', required: false })
  @Validate((value) => ['ASC', 'DESC'].includes(value.toUpperCase()), {
    message: 'Order must be either ASC or DESC',
  })
  @IsOptional()
  order: 'ASC' | 'DESC';

  @ApiProperty({ description: 'Search by username, fullname, email', example: 'admin', required: false })
  @IsString()
  @IsOptional()
  search: string;
}
