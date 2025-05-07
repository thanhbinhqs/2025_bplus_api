import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty } from "class-validator";


export class DeleteRoleDto {
    @ApiProperty({ description: 'Role ID' })
    @IsUUID('4')
    @IsNotEmpty()
    id: string;
}