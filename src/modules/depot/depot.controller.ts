import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { DepotService } from './depot.service';
import { CreateDepotDto, UpdateDepotDto } from './dto/depot.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('depot')
@UserAuthGuard()
@CanAccess(UserRole.HeadUser)
export class DepotController {
  constructor(private readonly depotService: DepotService) { }
  @Post('/create')
  @MyApiConsumes()
  create(@Body() createDepotDto: CreateDepotDto) {
    return this.depotService.create(createDepotDto);
  }
  @Get('/list')
  @CanAccess(UserRole.StationUser, UserRole.HeadUser)
  @PaginationDec()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.depotService.findAll(paginationDto);
  }

  @Get('/get-one/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.StationUser, UserRole.HeadUser)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.depotService.findOne(id);
  }
  @Get('/my')
  @MyApiConsumes()
  @CanAccess(UserRole.StationUser, UserRole.HeadUser)
  myDepot(@Param('id', ParseIntPipe) id: number) {
    return this.depotService.findOne(id);
  }
  @Patch('/update/:id')
  @MyApiConsumes()
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDepotDto: UpdateDepotDto) {
    return this.depotService.update(id, updateDepotDto);
  }

  @Delete('/remove/:id')
  @MyApiConsumes()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.depotService.remove(id);
  }
}
