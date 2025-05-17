import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserRole } from '../user/enum/role.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { SearchDto, SearchWithFuelAndReceiveDto } from './dto/search.dto';
import { ReceiveTimeEnum } from './enums/time.enum';
import { ApiQuery } from '@nestjs/swagger';
import { RejectDto } from 'src/common/dto/create-reject.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';

@Controller('request')
@UserAuthGuard()
export class RequestController {
    constructor(private readonly requestService: RequestService) { }
    //station
    @Post('/create')
    @MyApiConsumes()
    @CanAccess(UserRole.StationUser)
    create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestService.create(createRequestDto);
    }
    // head user
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @Get('/list')
    @PaginationDec()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.requestService.findAll(paginationDto);
    }

    @Get('/list/search')
    @PaginationDec()
    @ApiQuery({ type: 'number', name: 'fuel_type', required: true })
    @ApiQuery({ type: 'enum', enum: ReceiveTimeEnum, name: 'receive_at', required: false })
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByFuel(@Query() searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDto,@Query() paginationDto: PaginationDto) {
        return this.requestService.findByFuelType(searchWithFuelAndReceiveDto,paginationDto);
    }

    @Get('/by-date')
    @PaginationDec()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByDate(@Query() paginationDto: PaginationDto, @Query('end') end: Date, @Query('start') start?: Date) {
        const search: SearchDto = {
            start: start ? new Date(start) : new Date(),
            end: new Date(end)
        }
        return this.requestService.findByDate(search, paginationDto);
    }

    @Get('/by-id/:id')
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.findOne(id);
    }


    @Patch('/update/:id')
    @CanAccess(UserRole.StationUser)
    @MyApiConsumes()
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRequestDto: UpdateRequestDto) {
        return this.requestService.update(id, updateRequestDto);
    }
    @Patch('/approved/:id')
    @CanAccess(UserRole.OilDepotUser)
    license(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.approvedRequest(id);
    }
    @Patch('/received/:id')
    @CanAccess(UserRole.StationUser)
    received(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.receivedRequest(id);
    }
    @Patch('/reject/:id')
    @CanAccess(UserRole.OilDepotUser)
    reject(@Param('id', ParseIntPipe) id: number, @Body() rejectDto: RejectDto) {
        return this.requestService.rejectRequest(id, rejectDto);
    }
    @Delete('/remove/:id')
    @CanAccess(UserRole.StationUser)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.remove(+id);
    }
    @Get('/create/details')
    createRequestDetails() {
        return this.requestService.createRequestDetails()
    }

    // @Get('/archive')
    // @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    // getRequestArchive() {
    //     return this.requestService.getRequestArchive()
    // }
}
