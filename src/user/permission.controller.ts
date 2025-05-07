import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guards/auth.guard";
import { Utils } from "src/common/helpers/utils";

@Controller('permission')
@UseGuards(AuthGuard)
export class PermissionController {
   
    @Get()
    findAll() {
        const allPermissions = Utils.getAllAppPermissions();
        return allPermissions;
    }
}
