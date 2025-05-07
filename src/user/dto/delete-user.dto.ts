import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID, Validate } from "class-validator";
import { IsUuidV4 } from "src/common/validations/is-uuid";

export class DeleteUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsUUID('4')
  @IsNotEmpty()
  id: string;
}