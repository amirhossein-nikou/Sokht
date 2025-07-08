import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { MyApiConsumes } from "src/common/decorators/api-consume.dec";
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CreateInventoryDto, UpdateInventoryDto, UpdateValue } from "../dto/inventory.dto";
import { InventoryService } from "../services/inventory.service";
import { UserRole } from 'src/modules/user/enum/role.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
@ApiTags('Inventory')
@Controller('/station/inventory')
@UserAuthGuard()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser)
    @Post('/create')
    create(@Body() createInventoryDto: CreateInventoryDto) {
        return this.inventoryService.create(createInventoryDto);
    }

    @Get('/list')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    @PaginationDec()
    @ApiQuery({ name:"stationId" , required: false})
    findAll(@Query() paginationDto: PaginationDto, @Query('stationId') stationId: number) {
        return this.inventoryService.findAll(paginationDto,stationId);
    }
    @Get('/details/:fuel_type')
    @ApiTags('web')
    @CanAccess(UserRole.OilDepotUser)
    findAllInventoryDetails(
        @Param('fuel_type', ParseIntPipe) fuel_type: number,
    ) {
        return this.inventoryService.findAllInventoryDetails(fuel_type);
    }
    @Get('/list/lastUpdates')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    @PaginationDec()
    findListOfLastUpdates(@Query() paginationDto: PaginationDto) {
        return this.inventoryService.findListOfLastUpdates(paginationDto);
    }

    @Get('/get-one/:id')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    @UserAuthGuard()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.findOne(id);
    }

    @MyApiConsumes()
    @Patch('/update/:id')
    @CanAccess(UserRole.HeadUser)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateInventoryDto: UpdateInventoryDto) {
        return this.inventoryService.update(id, updateInventoryDto);
    }

    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    @Patch('/update-value/:id')
    updateValue(@Param('id', ParseIntPipe) id: number, @Body() updateValue: UpdateValue) {
        return this.inventoryService.updateValue(id, updateValue);
    }
    @Get('/status-toggle/:id')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    statusToggle(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.statusToggle(id);
    }
    @Delete('/remove/:id')
    @CanAccess(UserRole.HeadUser)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.remove(id);
    }
}