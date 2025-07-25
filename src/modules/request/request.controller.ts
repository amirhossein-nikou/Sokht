import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserRole } from '../user/enum/role.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { SearchByDate, SearchDto, SearchWithFuelAndReceiveDto } from './dto/search.dto';
import { ReceiveTimeEnum } from './enums/time.enum';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RejectDto } from 'src/common/dto/create-reject.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { fromEnum } from './enums/from.enum';

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
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @Get('/list/pending-approve')
    @ApiTags('web')
    @PaginationDec()
    findPendingApprove(@Query() paginationDto: PaginationDto) {
        return this.requestService.findPendingApprove(paginationDto);
    }
    @Get('list/by/:statusId')
    @MyApiConsumes()
    @ApiTags('web')
    @PaginationDec()
    @CanAccess(UserRole.OilDepotUser, UserRole.HeadUser)
    findByStatusId(@Param('statusId', ParseIntPipe) statusId: number, @Query() paginationDto: PaginationDto) {
        return this.requestService.findByStatus(statusId, paginationDto);
    }
    @Get('/list/search')
    @PaginationDec()
    @ApiQuery({ type: 'number', name: 'fuel_type', required: true })
    @ApiQuery({ type: 'enum', enum: ReceiveTimeEnum, name: 'receive_at', required: false })
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByFuel(@Query() searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDto, @Query() paginationDto: PaginationDto) {
        return this.requestService.findByFuelType(searchWithFuelAndReceiveDto, paginationDto);
    }

    @Get('/by-date')
    @PaginationDec()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    @ApiQuery({ name: 'end', required: false })
    @ApiQuery({ name: 'start', required: true })
    @ApiQuery({ type: 'number', name: 'fuel_type', required: false })
    findByDate(@Query() paginationDto: PaginationDto, @Query() searchDto: SearchDto) {
        const { end, start, fuel_type } = searchDto
        const search: SearchDto = {
            start: new Date(start),
            end: end ? new Date(end) : new Date(),
            fuel_type
        }
        return this.requestService.findByDate(search, paginationDto);
    }

    @Get('/by-id/:id')
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.findOne(id);
    }
    @Get('/reports')
    @ApiQuery({ name: 'end', required: true })
    @ApiQuery({ name: 'start', required: true })
    @ApiQuery({ name: 'from', required: true,enum: fromEnum })
    @CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
    reports(@Query() searchDto: SearchByDate,@Query('from') from: fromEnum) {
        const { end, start } = searchDto
        const search: SearchByDate = {
            start: new Date(start),
            end: new Date(end),
        }
        return this.requestService.reports(search,from);
    }    
    @Get('/reports/daily/:id')
    @ApiQuery({ name: 'end', required: true })
    @ApiQuery({ name: 'start', required: true })
    @ApiQuery({ name: 'from', required: true,enum: fromEnum })
    @CanAccess(UserRole.HeadUser, UserRole.OilDepotUser)
    dailyReports(@Query() searchDto: SearchByDate,@Query('from') from: fromEnum,@Param('id',ParseIntPipe) id: number) {
        const { end, start } = searchDto
        const search: SearchByDate = {
            start: new Date(start),
            end: new Date(end),
        }
        return this.requestService.dailyReports(search,from,id);
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
    @Patch('/status/sendTanker/:id')
    @CanAccess(UserRole.OilDepotUser)
    sendTankerForRequest(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.sendTankerForRequest(id);
    }
    @Patch('/received/:id')
    @CanAccess(UserRole.StationUser)
    @ApiQuery({ type: 'enum', enum: ReceiveTimeEnum, name: 'time', required: false })
    received(@Param('id', ParseIntPipe) id: number, @Query('time') time: ReceiveTimeEnum) {
        return this.requestService.receivedRequest(id, time);
    }
    @Patch('/reject/:id')
    @ApiTags('web')
    @MyApiConsumes()
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
