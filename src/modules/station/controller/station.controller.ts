import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { StationService } from './../services/station.service';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { ResponseUtils } from 'src/common/utils/response.utils';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StationMessages } from '../enum/message.enum';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) { }

  @Post('/create')
  @MyApiConsumes()
  @ApiOperation({ summary: StationMessages.CreatedDesc })
  @ApiResponse(ResponseUtils(HttpStatus.CREATED, StationMessages.Created, StationMessages.CreatedDesc))
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
  findAll() {
    return this.stationService.findAll();
  }

  @Get('/get-one/:id')
  @ApiOkResponse({
    example: {
      "status": HttpStatus.OK,
      "data": {
        "id": 0,
        "name": "string",
        "isActive": 'boolean',
        "ownerId": 1,
        "locationId": 2,
        "createdAt": "2025-03-18T09:26:50.877Z",
        "location": null,
        "average_sales": [
          {
            "monthly_average_sale": 300,
            "fuel_type": "petrol",
            "createdAt": "2025-03-24T10:52:11.234Z"
          }
        ]
      }
    }
  })
  @ApiOperation({ summary: StationMessages.GetOne })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.findOne(id);
  }

  @Patch('/update/:id')
  @MyApiConsumes()
  @ApiOperation({ summary: StationMessages.UpdateDesc })
  @ApiResponse(ResponseUtils(HttpStatus.CREATED, StationMessages.Update, StationMessages.UpdateDesc))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(id, updateStationDto);
  }

  @Delete('/remove/:id')
  @ApiOperation({ summary: StationMessages.RemoveDesc })
  @ApiResponse(ResponseUtils(HttpStatus.OK, StationMessages.Remove, StationMessages.RemoveDesc))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stationService.remove(id);
  }
}
