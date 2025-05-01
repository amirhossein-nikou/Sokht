import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FuelTypeService } from './fuel-type.service';
import { CreateFuelTypeDto } from './dto/create-fuel-type.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';

@Controller('fuel-type')
@UserAuthGuard()
export class FuelTypeController {
  constructor(private readonly fuelTypeService: FuelTypeService) { }

  @Post('/create')
  @CanAccess(UserRole.HeadUser)
  @MyApiConsumes()
  create(@Body() createFuelTypeDto: CreateFuelTypeDto) {
    return this.fuelTypeService.create(createFuelTypeDto);
  }

  @Get('/list')
  @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
  findAll() {
    return this.fuelTypeService.findAll();
  }

  @Get('/one-by/:id')
  @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
  findOne(@Param('id') id: string) {
    return this.fuelTypeService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFuelTypeDto: UpdateFuelTypeDto) {
  //   return this.fuelTypeService.update(+id, updateFuelTypeDto);
  // }

  @Delete('/remove/:id')
  @CanAccess(UserRole.HeadUser)
  remove(@Param('id') id: string) {
    return this.fuelTypeService.remove(+id);
  }
}
