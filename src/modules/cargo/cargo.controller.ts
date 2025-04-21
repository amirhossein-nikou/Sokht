import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';

@Controller('cargo')
@UserAuthGuard()
export class CargoController {
  constructor(private readonly cargoService: CargoService) { }
  @CanAccess(UserRole.OilDepotUser)
  @Post('/create')
  create(@Body() createCargoDto: CreateCargoDto) {
    return this.cargoService.create(createCargoDto);
  }

  @Get('/list')
  @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
  findAll() {
    return this.cargoService.findAll();
  }

  @Get('/one-by/:id')
  @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargoService.findOne(id);
  }
  @Patch('/update/:id')
  @CanAccess(UserRole.OilDepotUser)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCargoDto: UpdateCargoDto) {
    return this.cargoService.update(id, updateCargoDto);
  }

  @Delete('/remove/:id')
  @CanAccess(UserRole.OilDepotUser)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cargoService.remove(id);
  }
}
