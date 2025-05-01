import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FuelTypeService } from './fuel-type.service';
import { CreateFuelTypeDto } from './dto/create-fuel-type.dto';
import { UpdateFuelTypeDto } from './dto/update-fuel-type.dto';

@Controller('fuel-type')
export class FuelTypeController {
  constructor(private readonly fuelTypeService: FuelTypeService) {}

  @Post('/create')
  create(@Body() createFuelTypeDto: CreateFuelTypeDto) {
    return this.fuelTypeService.create(createFuelTypeDto);
  }

  @Get('/list')
  findAll() {
    return this.fuelTypeService.findAll();
  }

  @Get('/one-by/:id')
  findOne(@Param('id') id: string) {
    return this.fuelTypeService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFuelTypeDto: UpdateFuelTypeDto) {
  //   return this.fuelTypeService.update(+id, updateFuelTypeDto);
  // }

  @Delete('/remove/:id')
  remove(@Param('id') id: string) {
    return this.fuelTypeService.remove(+id);
  }
}
