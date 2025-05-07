import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class SetUserRoleDto {
    @ApiProperty({description: 'User ID'})
    @IsUUID('4')
    @IsNotEmpty()
    id: string;

    @ApiProperty({description: 'Role ID array'})
    @IsUUID('4', {each: true})
    roleId: string[];
}   