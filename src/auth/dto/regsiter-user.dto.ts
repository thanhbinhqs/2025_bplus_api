import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one special character, and one number',
    },
  )
  password: string;

  @ApiProperty({ example: 'abc@def.com', description: 'Email of the user' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'full name of the user' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  //address
  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address of the user',
  })
  @IsOptional()
  @IsString()
  address?: string;

  //avatar base64
  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Avatar of the user in base64 format',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  //gen string field
  @ApiProperty({ example: '1234567890', description: 'Gen of the user' })
  @IsOptional()
  @IsString()
  gen?: string;
}
