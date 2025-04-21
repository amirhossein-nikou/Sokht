import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MyApiConsumes } from "src/common/decorators/api-consume.dec";
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CreateCapacityDto, UpdateCapacityDto } from '../dto/capacity.dto';
import { CapacityService } from '../services/capacity.service';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/modules/user/enum/role.enum';

@Controller('/station/capacity')
@UserAuthGuard()
export class CapacityController {
    constructor(private readonly capacityService: CapacityService) { }
    @MyApiConsumes()
    @Post('/create')
    create(@Body() createCapacityDto: CreateCapacityDto) {
        return this.capacityService.create(createCapacityDto);
    }

    @Get('/list')
    @CanAccess(UserRole.StationUser,UserRole.HeadUser)
    findAll() {
        return this.capacityService.findAll();
    }

    @Get('/get-one/:id')
    @CanAccess(UserRole.StationUser,UserRole.HeadUser)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.capacityService.findOne(id);
    }

    @MyApiConsumes()
    @Patch('/update/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCapacityDto: UpdateCapacityDto) {
        return this.capacityService.update(id, updateCapacityDto);
    }

    @Delete('/remove/:id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.capacityService.remove(id);
    }
    @Get('/status-toggle/:id')
    @CanAccess(UserRole.HeadUser)
    statusToggle(@Param('id', ParseIntPipe) id: number) {
        return this.capacityService.capacityStatusToggle(id);
    }
}