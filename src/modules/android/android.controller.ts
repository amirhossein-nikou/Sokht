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
import { RequestServiceAndroid } from "../request/request.android.service";
import { UpdateValueAndroid } from "../station/dto/inventory.dto";
import { InventoryService } from "../station/services/inventory.service";
import { TankerService } from "../tanker/tanker.service";
import { UpdateMobileDtoAndroid } from "../user/dto/update-user.dto";
import { UserRole } from "../user/enum/role.enum";
import { UserServiceAndroid } from "../user/user.android.service";
import { AddSubUserDto, AddSubUserDtoAndroid } from "../user/dto/create-user.dto";

@Controller()
@UserAuthGuard()
export class AndroidController {
    constructor(
        private readonly userService: UserServiceAndroid,
        private readonly inventoryService: InventoryService,
        private readonly requestService: RequestServiceAndroid,
        private readonly tankerService: TankerService,
    ) { }

    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    @Patch('/android/inventory/update/value/:id')
    updateValue(@Param('id', ParseIntPipe) id: number, @Body() updateValue: UpdateValueAndroid) {
        return this.inventoryService.updateValueAndroid(id, updateValue);
    }
    @Post('/android/request/create')
    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    create(@Body() createRequestDto: CreateRequestDtoAndroid) {
        return this.requestService.create(createRequestDto);
    }
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @Get('/android/request/list')
    @PaginationDec()
    findAllRequests(@Query() paginationDto: PaginationDto) {
        return this.requestService.findAll(paginationDto);
    }

    @Get('/android/request/list/search')
    @PaginationDec()
    @ApiQuery({ type: 'number', name: 'fuel_type', required: true })
    @ApiQuery({ type: 'enum', enum: ReceiveTimeEnum, name: 'receive_at', required: false })
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByFuel(@Query() searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDtoAndroid, @Query() paginationDto: PaginationDto) {
        return this.requestService.findByFuelType(searchWithFuelAndReceiveDto, paginationDto);
    }

    @Get('/android/request/by-date')
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
        return this.requestService.findByDate(search, paginationDto);
    }
    @Patch('/android/request/update/:id')
    @CanAccess(UserRole.StationUser)
    @MyApiConsumes()
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRequestDto: UpdateRequestDtoAndroid) {
        return this.requestService.update(id, updateRequestDto);
    }
    @Patch('/android/request/received/:id')
    @CanAccess(UserRole.StationUser)
    received(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.receivedRequest(id);
    }
    @Get('/android/request/create/details')
    createRequestDetails() {
        return this.requestService.createRequestDetails()
    }
    @Get('/android/request/tanker/info/:id')
    getRequestTankerInfo(@Param('id', ParseIntPipe) id: number) {
        return this.tankerService.findByRequestIdAndroid(id)
    }
    // user routes
    @Post('android/user/sub-user')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    addSubUser(@Body() addSubUserDto: AddSubUserDtoAndroid) {
        return this.userService.addSubUsers(addSubUserDto);
    }
    @Get('android/user/profile')
    @MyApiConsumes()
    profile() {
        return this.userService.profile();
    }
    @Patch('android/user/subUser-phone/:id')
    @MyApiConsumes()
    updateSubUserMobile(@Param('id', ParseIntPipe) id: number, @Body() updateMobileDto: UpdateMobileDtoAndroid) {
        return this.userService.updateSubUserMobile(id, updateMobileDto);
    }
    @Patch('android/user/mobile')
    @MyApiConsumes()
    updateMyMobile(@Body() updateMobileDto: UpdateMobileDtoAndroid) {
        return this.userService.updateMyPhone(updateMobileDto);
    }
    @Delete('android/user/removeSub/:id')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    removeSubUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.removeSubUser(id);
    }
    @Get('android/user/verify-change/:code')
    verifyChangeMobile(@Param('code') code: string) {
        console.log();
        return this.userService.verifyUpdateMobile(code);
    }
    @Get('android/user/sub-users')
    mySubUsers() {
        console.log();
        return this.userService.mySubUsers();
    }
}