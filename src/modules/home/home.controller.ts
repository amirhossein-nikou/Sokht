import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { UserAuthGuard } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { HomeService } from "./home.service";

@Controller()
@UserAuthGuard()
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get('/dashboard')
  @CanAccess()
  findAll(@Query('inventoryId',ParseIntPipe) inventoryId: number,@Query('cargoId',ParseIntPipe) cargoId: number) {
    return this.homeService.dashboard({inventoryId,cargoId});
  }
}