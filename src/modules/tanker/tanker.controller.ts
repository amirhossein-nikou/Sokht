import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Search } from '@nestjs/common';
import { TankerService } from './tanker.service';
import { CreateTankerDto } from './dto/create-tanker.dto';
import { UpdateTankerDto } from './dto/update-tanker.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('tanker')
@UserAuthGuard()
export class TankerController {
  constructor(private readonly tankerService: TankerService) { }

  @Post('/create')
  @ApiTags('web')
  @MyApiConsumes()
  @CanAccess(UserRole.OilDepotUser)
  create(@Body() createTankerDto: CreateTankerDto) {
    return this.tankerService.create(createTankerDto);
  }

  @Get('/list')
  @ApiTags('web')
  @CanAccess(UserRole.OilDepotUser)
  @PaginationDec()
  @ApiQuery({type:'string',required: false,name:'search'})
  findAll(@Query() paginationDto: PaginationDto,@Query('search') search?:string) {
    return this.tankerService.findAll(search,paginationDto);
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
  @MyApiConsumes()
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
