import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsUUID, IsNotEmpty, IsString, IsOptional, ValidateNested } from "class-validator";
import { PermissionDto } from "./set-user-permission.dto";


export class UpdateRoleDto {
    @ApiProperty({ description: 'Role ID' })
    @IsUUID('4')
    @IsNotEmpty()
    id: string;
    
    @ApiProperty({ description: 'Role name' })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ description: 'Role description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Role permissions' })
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    @IsOptional()
    permissions?: PermissionDto[];
}