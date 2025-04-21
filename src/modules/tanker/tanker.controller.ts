import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TankerService } from './tanker.service';
import { CreateTankerDto } from './dto/create-tanker.dto';
import { UpdateTankerDto } from './dto/update-tanker.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';

@Controller('tanker')
@UserAuthGuard()
export class TankerController {
  constructor(private readonly tankerService: TankerService) { }

  @Post('/create')
  @CanAccess(UserRole.OilDepotUser)
  create(@Body() createTankerDto: CreateTankerDto) {
    return this.tankerService.create(createTankerDto);
  }

  @Get('/list')
  @CanAccess(UserRole.OilDepotUser)
  findAll() {
    return this.tankerService.findAll();
  }

  @Get('/by-id/:id')
  @CanAccess(UserRole.OilDepotUser)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tankerService.findOne(id);
  }
  @Get('/by-driverId/:driverId')
  @CanAccess(UserRole.OilDepotUser)
  findOneByDriverId(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.tankerService.findOneByDriverId(driverId);
  }

  @UserAuthGuard()
  @CanAccess(UserRole.Driver)
  @Get('/your-tanker')
  driverTankerInfo() {
    return this.tankerService.driverTankerInfo();
  }

  @Patch('/update/:id')
  @CanAccess(UserRole.OilDepotUser)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTankerDto: UpdateTankerDto) {
    return this.tankerService.update(id, updateTankerDto);
  }

  @Delete('/remove/:id')
  @CanAccess(UserRole.OilDepotUser)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tankerService.remove(id);
  }
}
