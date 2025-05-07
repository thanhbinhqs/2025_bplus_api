import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsJSON, IsDate, ValidateNested } from "class-validator";

export class SetUserPermissionDto {
    @ApiProperty({description: 'User ID'})
    @IsUUID('4')
    @IsNotEmpty()
    id: string;

    @ApiProperty({description: 'Permission ID array'})
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions: PermissionDto[];
}

export class PermissionDto {
    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    action: string;

    @ApiProperty({})
    @IsString()
    @IsJSON()
    @IsOptional()
    attributes?: string;

    @ApiProperty({})
    @IsDate()
    @IsOptional()
    expirationDate?: Date;
}