import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdateUserProfileDto {
        @ApiProperty({ description: 'User ID' })
        @IsUUID('4')
        @IsNotEmpty()
        id: string;

        @ApiProperty({ description: 'Full Name' })
        @IsOptional()
        @IsString()
        fullname?: string;

        @ApiProperty({ description: 'Email' })
        @IsOptional()
        @IsString()
        email?: string;

        @ApiProperty({ description: 'Phone' })
        @IsOptional()
        @IsString()
        phone?: string;

        @ApiProperty({ description: 'Address' })
        @IsOptional()
        @IsString()
        address?: string;

        @ApiProperty({ description: 'Gen' })
        @IsOptional()
        @IsString()
        gen?: string;

        @ApiProperty({ description: 'Avatar' })
        @IsOptional()
        @IsString()
        avatar?: string;

}