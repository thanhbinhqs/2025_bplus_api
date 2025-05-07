import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class SetUserPasswordDto {
  @ApiProperty()
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one special character, and one number',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
