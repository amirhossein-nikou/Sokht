import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { RejectDto } from 'src/common/dto/create-reject.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserRole } from '../user/enum/role.enum';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Controller('cargo')
@UserAuthGuard()
export class CargoController {
  constructor(private readonly cargoService: CargoService) { }
  @CanAccess(UserRole.OilDepotUser)
  @MyApiConsumes()
  @Post('/create')
  create(@Body() createCargoDto: CreateCargoDto) {
    return this.cargoService.create(createCargoDto);
  }

  @Get('/list')
  @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
  @PaginationDec()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cargoService.findAll(paginationDto);
  }

  @Get('/one-by/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargoService.findOne(id);
  }
  @Get('/by-fuel/:fuel_type')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
  @PaginationDec()
  findWithFuelType(@Param('fuel_type', ParseIntPipe) fuel_type: number, @Query() paginationDto: PaginationDto) {
    return this.cargoService.findWithFuelType(fuel_type, paginationDto);
  }
  @Patch('/update/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCargoDto: UpdateCargoDto) {
    return this.cargoService.update(id, updateCargoDto);
  }
  @Patch('/reject/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser)
  reject(@Param('id', ParseIntPipe) id: number, @Body() rejectDto: RejectDto) {
    return this.cargoService.rejectCargo(id, rejectDto);
  }

  @Delete('/remove/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cargoService.remove(id);
  }
}
