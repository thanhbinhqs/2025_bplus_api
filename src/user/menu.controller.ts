import { Controller, Get, UseGuards } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { AllowAnonymous } from "src/common/decorators/allow-anonymous";
import { AuthGuard } from "src/common/guards/auth.guard";


@Controller('menu')
@UseGuards(AuthGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Get()
    @AllowAnonymous(true)
    getMenu() {
        return this.menuService.findMenu();
    }
}