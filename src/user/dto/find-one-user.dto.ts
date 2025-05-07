import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsNotEmpty, isNotEmpty, IsOptional, IsString, IsUUID, Validate } from "class-validator";
import { IsUuidOrString } from "src/common/validations/is-uuid-string";

export class FindOneUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @Validate(IsUuidOrString,{ message: 'Input user UUID or username' })
  @IsNotEmpty()
  id: string;
}