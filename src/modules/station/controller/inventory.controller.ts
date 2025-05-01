import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MyApiConsumes } from "src/common/decorators/api-consume.dec";
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CreateInventoryDto, UpdateInventoryDto, UpdateValue } from "../dto/inventory.dto";
import { InventoryService } from "../services/inventory.service";
import { UserRole } from 'src/modules/user/enum/role.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
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
    findAll() {
        return this.inventoryService.findAll();
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
    @CanAccess(UserRole.StationUser,UserRole.HeadUser)
    statusToggle(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.statusToggle(id);
    }
    @Delete('/remove/:id')
    @CanAccess(UserRole.HeadUser)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.inventoryService.remove(id);
    }
}