import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationService } from './location.service';

@Controller('location')
@UserAuthGuard()
@CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post('/create')
  @MyApiConsumes()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get('/list')
  findAll() {
    return this.locationService.findAll();
  }

  @Get('/get-one/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.findOne(id);
  }

  @Patch('/update/:id')
  @MyApiConsumes()
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete('/remove/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.locationService.remove(id);
  }
}
