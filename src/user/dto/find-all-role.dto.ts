import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsNumberString, IsOptional, IsString, Validate } from "class-validator";

export class FindAllRoleDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsNumberString()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', example: 10, required: false })
  @IsNumberString()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Search by name', example: 'administrator', required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
