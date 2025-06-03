import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { MyApiConsumes } from "src/common/decorators/api-consume.dec";
import { UserAuthGuard } from "src/common/decorators/auth.decorator";
import { PaginationDec } from "src/common/decorators/paginatio.decorator";
import { CanAccess } from "src/common/decorators/role.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { CreateRequestDtoAndroid } from "../request/dto/create-request.dto";
import { SearchDto, SearchDtoAndroid, SearchWithFuelAndReceiveDtoAndroid } from "../request/dto/search.dto";
import { UpdateRequestDtoAndroid } from "../request/dto/update-request.dto";
import { ReceiveTimeEnum } from "../request/enums/time.enum";
import { UpdateValueAndroid } from "../station/dto/inventory.dto";

import { AddSubUserDtoAndroid } from "../user/dto/create-user.dto";
import { UpdateMobileDtoAndroid } from "../user/dto/update-user.dto";
import { UserRole } from "../user/enum/role.enum";
import { AndroidService } from "./android.service";

@Controller('/android')
@UserAuthGuard()
export class AndroidController {
    constructor(
        private readonly androidService: AndroidService
    ) { }

    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    @Patch('/inventory/update/value/:id')
    updateValue(@Param('id', ParseIntPipe) id: number, @Body() updateValue: UpdateValueAndroid) {
        return this.androidService.updateValueAndroid(id, updateValue);
    }
    @Get('/inventory/list')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    @PaginationDec()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.androidService.findAllInventories(paginationDto);
    }
    @Get('/inventory/status-toggle/:id')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    statusToggle(@Param('id', ParseIntPipe) id: number) {
        return this.androidService.changeInventoryStatus(id);
    }
    @Get('/inventory/list/lastUpdates')
    @CanAccess(UserRole.StationUser, UserRole.HeadUser)
    @PaginationDec()
    findListOfLastUpdates(@Query() paginationDto: PaginationDto) {
        return this.androidService.inventoryLastUpdate(paginationDto);
    }
    @Post('/request/create')
    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    create(@Body() createRequestDto: CreateRequestDtoAndroid) {
        return this.androidService.createNewRequest(createRequestDto);
    }
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @Get('/request/list')
    @PaginationDec()
    findAllRequests(@Query() paginationDto: PaginationDto) {
        return this.androidService.findAllRequests(paginationDto);
    }

    @Get('/request/list/search')
    @PaginationDec()
    @ApiQuery({ type: 'number', name: 'fuel_type', required: true })
    @ApiQuery({ type: 'enum', enum: ReceiveTimeEnum, name: 'receive_at', required: false })
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByFuel(@Query() searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDtoAndroid, @Query() paginationDto: PaginationDto) {
        return this.androidService.findByFuelType(searchWithFuelAndReceiveDto, paginationDto);
    }

    @Get('/request/by-date')
    @PaginationDec()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @ApiQuery({ name: 'end', required: false })
    @ApiQuery({ name: 'start', required: true })
    @ApiQuery({ type: 'number', name: 'fuel_type', required: false })
    findByDate(@Query() paginationDto: PaginationDto, @Query() searchDto: SearchDtoAndroid) {
        const { end, start, fuel_type } = searchDto
        const search: SearchDto = {
            start: new Date(start),
            end: end ? new Date(end) : new Date(),
            fuel_type
        }
        return this.androidService.findByDate(paginationDto, search);
    }
    @Patch('/request/update/:id')
    @CanAccess(UserRole.StationUser)
    @MyApiConsumes()
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRequestDto: UpdateRequestDtoAndroid) {
        return this.androidService.update(id, updateRequestDto);
    }
    @Patch('/request/received/:id')
    @CanAccess(UserRole.StationUser)
    received(@Param('id', ParseIntPipe) id: number) {
        return this.androidService.receivedRequest(id);
    }
    @Get('/request/create/details')
    createRequestDetails() {
        return this.androidService.createRequestDetails()
    }
    @Get('/request/tanker/info/:id')
    getRequestTankerInfo(@Param('id', ParseIntPipe) id: number) {
        return this.androidService.getRequestTankerInfo(id)
    }
    // user routes
    @Post('/user/sub-user')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    addSubUser(@Body() addSubUserDto: AddSubUserDtoAndroid) {
        return this.androidService.addSubUser(addSubUserDto);
    }
    @Get('/user/profile')
    @MyApiConsumes()
    profile() {
        return this.androidService.profile();
    }
    @Patch('/user/subUser-phone/:id')
    @MyApiConsumes()
    updateSubUserMobile(@Param('id', ParseIntPipe) id: number, @Body() updateMobileDto: UpdateMobileDtoAndroid) {
        return this.androidService.updateSubUserMobile(id, updateMobileDto);
    }
    @Patch('/user/mobile')
    @MyApiConsumes()
    updateMyMobile(@Body() updateMobileDto: UpdateMobileDtoAndroid) {
        return this.androidService.updateMyPhone(updateMobileDto);
    }
    @Delete('/user/removeSub/:id')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    removeSubUser(@Param('id', ParseIntPipe) id: number) {
        return this.androidService.removeSubUser(id);
    }
    @Get('/user/verify-change/:code')
    verifyChangeMobile(@Param('code') code: string) {
        console.log();
        return this.androidService.verifyUpdateMobile(code);
    }
    @Get('/user/sub-users')
    mySubUsers() {
        console.log();
        return this.androidService.mySubUsers();
    }
    @Get('/notification/list')
    @PaginationDec()
    findAllNotifications(@Query() paginationDto: PaginationDto) {
        return this.androidService.findAllNotifications(paginationDto);
    }
    
    @Delete('/remove/request/:id')
    @CanAccess(UserRole.StationUser)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.androidService.receivedRequest(id);
    }
}