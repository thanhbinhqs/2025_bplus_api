import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'admin', description: 'Username of the user' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: '1234567890', description: 'Password of the user' })
    @IsNotEmpty()
    @IsString()
    password: string;
}