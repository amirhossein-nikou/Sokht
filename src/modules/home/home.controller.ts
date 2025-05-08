import { Controller, Get, ParseIntPipe, Query } from "@nestjs/common";
import { UserAuthGuard } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { HomeService } from "./home.service";
import { ReceiveTimeEnum } from "../request/enums/time.enum";

@Controller()
@UserAuthGuard()
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get('/dashboard')
  @CanAccess()
  findAll() {
    return this.homeService.dashboard();
  }
}