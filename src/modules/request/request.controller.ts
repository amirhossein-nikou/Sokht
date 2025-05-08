import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserRole } from '../user/enum/role.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { SearchDto } from './dto/search.dto';
import { ReceiveTimeEnum } from './enums/time.enum';

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
    findAll() {
        return this.requestService.findAll();
    }
    @Get('/by-id/:id')
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.findOne(id);
    }
    @Get('/by-date')
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    findByDate(@Query('end') end: Date, @Query('start') start?: Date) {
        const search: SearchDto = {
            start: start ? new Date(start) : new Date(),
            end: new Date(end)
        }
        return this.requestService.findByDate(search);
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
    @Delete('/remove/:id')
    @CanAccess(UserRole.StationUser)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.remove(+id);
    }
    @Get('/create/details')
    createRequestDetails() {
      return this.requestService.createRequestDetails()
    }
}
