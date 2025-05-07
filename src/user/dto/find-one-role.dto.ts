import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, Validate } from 'class-validator';
import { IsUuidOrString } from 'src/common/validations/is-uuid-string';

export class FindOneRoleDto {
  @ApiProperty({ description: 'Role ID' })
  @Validate(IsUuidOrString, {
    message: 'Find by role UUID or role name',
  })
  @IsNotEmpty()
  id: string;
}
