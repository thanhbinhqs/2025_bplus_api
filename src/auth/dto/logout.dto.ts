import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: '', description: 'access token' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
