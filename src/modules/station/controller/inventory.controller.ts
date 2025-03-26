import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MyApiConsumes } from "src/common/decorators/api-consume.dec";
import { ResponseUtils } from 'src/common/utils/response.utils';
import { CreateInventoryDto, UpdateInventoryDto } from "../dto/inventory.dto";
import { InventoryService } from "../services/inventory.service";
import { InventoryMessages } from '../enum/message.enum';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';

@Controller('/station/inventory')
@UserAuthGuard()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }
    @MyApiConsumes()
    @ApiOperation({ summary: InventoryMessages.CreatedDesc })
    @ApiResponse(ResponseUtils(HttpStatus.CREATED,InventoryMessages.Created,InventoryMessages.CreatedDesc))
    @Post('/create')
    create(@Body() createInventoryDto: CreateInventoryDto) {
        return this.inventoryService.create(createInventoryDto);
    }

    @Get('/list')
    @ApiOperation({ summary:InventoryMessages.GetAll })
    @ApiOkResponse({example: {
        "status": HttpStatus.OK,
        "data": [
          {
            "id": 0,
            "value": "2400",
            "fuel_type": "diesel",
            "stationId": 1,
            "updatedAt": "2025-03-24T14:37:12.487Z"
          }
        ]
    }})
    findAll() {
        return this.inventoryService.findAll();
    }

    @Get('/get-one/:id')
    @UserAuthGuard()
    @ApiOperation({ summary: InventoryMessages.GetOne })
    @ApiOkResponse({ description: InventoryMessages.GetOne, example:{
        "status": HttpStatus.OK,
        "data": {
          "id": 0,
          "value": "2400",
          "fuel_type": "diesel",
          "stationId": 1,
          "updatedAt": "2025-03-24T14:37:12.487Z"
        }
      }})
    @ApiNotFoundResponse({ description: InventoryMessages.NotFound })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.findOne(id);
    }

    @MyApiConsumes()
    @ApiOperation({ summary:  InventoryMessages.UpdateDesc})
    @ApiResponse(ResponseUtils(HttpStatus.CREATED,InventoryMessages.Update,InventoryMessages.UpdateDesc))
    @Patch('/update/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateInventoryDto: UpdateInventoryDto) {
        return this.inventoryService.update(id, updateInventoryDto);
    }

    @Delete('/remove/:id')
    @ApiOperation({ summary:InventoryMessages.RemoveDesc })
    @ApiResponse(ResponseUtils(HttpStatus.OK,InventoryMessages.Remove,InventoryMessages.RemoveDesc))
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.remove(id);
    }
}