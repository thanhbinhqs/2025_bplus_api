import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNotEmpty } from "class-validator";

export class SetUserActiveDto {
    @ApiProperty()
    @IsUUID('4')
    @IsNotEmpty()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    active: boolean;
}