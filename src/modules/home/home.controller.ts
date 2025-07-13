import { Controller, Get} from "@nestjs/common";
import { UserAuthGuard } from "src/common/decorators/auth.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { HomeService } from "./home.service";
import { ApiTags } from "@nestjs/swagger";
@ApiTags('Home')
@Controller()
@UserAuthGuard()
export class HomeController {
  constructor(private readonly homeService: HomeService) { }

  @Get('/android/dashboard')
  @ApiTags('Android')
  @CanAccess()
  findAll() {
    return this.homeService.dashboard();
  }
  @Get('dashboard/head')
  @CanAccess()
  headDashboard() {
    return this.homeService.headDashboard();
  }
}