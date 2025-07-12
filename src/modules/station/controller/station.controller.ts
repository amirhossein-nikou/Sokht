import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, Query, ParseBoolPipe } from '@nestjs/common';
import { StationService } from './../services/station.service';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { ResponseUtils } from 'src/common/utils/response.utils';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StationMessages } from '../enum/message.enum';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/modules/user/enum/role.enum';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LimitService } from '../services/limit.service';
import { LimitDto } from '../dto/limit.dto';

@Controller('station')
@UserAuthGuard()
export class StationController {
  constructor(
    private readonly stationService: StationService,
    private readonly limitService: LimitService

  ) { }

  //depot - r - head -> crud
  @Post('/create')
  @MyApiConsumes()
  @ApiOperation({ summary: StationMessages.CreatedDesc })
  @ApiResponse(ResponseUtils(HttpStatus.CREATED, StationMessages.Created, StationMessages.CreatedDesc))
  @CanAccess(UserRole.HeadUser)
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Get('/list')
  @ApiOperation({ summary: StationMessages.GetAll })
  @ApiOkResponse({
    example: {
      "status": HttpStatus.OK,
      "data": [
        {
          "id": 'number',
          "name": "string",
          "isActive": 'boolean',
          "ownerId": 'number',
          "locationId": 'number',
          "createdAt": "date"
        }
      ]
    }
  })
  @CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
  @PaginationDec()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.stationService.findAll(paginationDto);
  }
  @Get('/list/limit/:by_user')
  @CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
  @PaginationDec()
  @ApiQuery({name:"date" ,required: false})
  findAllChangedLimit(@Query() paginationDto: PaginationDto,
   @Param('by_user', ParseBoolPipe) by_user: boolean,
   @Query('date') date: string
  ) {
    return this.stationService.findAllChangedLimit(paginationDto, by_user,date);
  }

  @Get('/get-one/:id')
  @CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOne(id);
  }
  @Get('/my')
  @CanAccess(UserRole.StationUser)
  myStation() {
    return this.stationService.myStation();
  }
  @Patch('/update/:id')
  @MyApiConsumes()
  @CanAccess(UserRole.HeadUser)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(id, updateStationDto);
  }

  @Delete('/remove/:id')
  @CanAccess(UserRole.HeadUser)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.remove(id);
  }
  @Get('/status-toggle/:id')
  @CanAccess(UserRole.HeadUser)
  statusToggle(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.stationStatusToggle(id);
  }
  @Post('/limit/diesel')
  @CanAccess(UserRole.OilDepotUser,UserRole.HeadUser)
  @MyApiConsumes()
  addLimitForDiesel(@Body() limitDto: LimitDto) {
    limitDto.by_user = true
    return this.limitService.AddLimit(limitDto);
  }
}
