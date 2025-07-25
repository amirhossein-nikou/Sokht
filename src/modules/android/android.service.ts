import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.utils";
import { Repository } from "typeorm";
import { HomeService } from "../home/home.service";
import { NotificationEntity } from "../notification/entity/notification.entity";
import { CreateRequestDtoAndroid } from "../request/dto/create-request.dto";
import { SearchDtoAndroid, SearchWithFuelAndReceiveDtoAndroid } from "../request/dto/search.dto";
import { UpdateRequestDtoAndroid } from "../request/dto/update-request.dto";
import { ReceiveTimeEnum } from "../request/enums/time.enum";
import { RequestService } from "../request/request.service";
import { UpdateValueAndroid } from "../station/dto/inventory.dto";
import { InventoryService } from "../station/services/inventory.service";
import { TankerService } from "../tanker/tanker.service";
import { AddSubUserDto } from "../user/dto/create-user.dto";
import { UpdateMobileDtoAndroid } from "../user/dto/update-user.dto";
import { UserService } from "../user/user.service";

@Injectable({ scope: Scope.REQUEST })
export class AndroidService {
    constructor(
        @Inject(REQUEST) private req: Request,
        private userService: UserService,
        private inventoryService: InventoryService,
        private requestService: RequestService,
        private tankerService: TankerService,
        private homeService: HomeService,
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
    ) { }
    showDashboard() {
        return this.homeService.dashboard()
    }
    updateValueAndroid(id: number, updateValue: UpdateValueAndroid) {
        console.log(updateValue);
        return this.inventoryService.updateValueAndroid(id, updateValue);
    }
    findAllInventories(paginationDto: PaginationDto, stationId: number) {
        return this.inventoryService.findAll(paginationDto,stationId)
    }
    changeInventoryStatus(inventoryId: number) {
        return this.inventoryService.statusToggle(inventoryId)
    }
    inventoryLastUpdate(paginationDto: PaginationDto) {
        return this.inventoryService.findListOfLastUpdatesAndroid(paginationDto)
    }
    createNewRequest(createRequestDto: CreateRequestDtoAndroid) {
        return this.requestService.create(createRequestDto);
    }

    findAllRequests(paginationDto: PaginationDto) {
        return this.requestService.findAll(paginationDto);
    }


    findByFuelType(searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDtoAndroid, paginationDto: PaginationDto) {
        return this.requestService.findByFuelType(searchWithFuelAndReceiveDto, paginationDto);
    }

    findByDate(paginationDto: PaginationDto, searchDto: SearchDtoAndroid) {
        const { end, start, fuel_type } = searchDto
        const search: SearchDtoAndroid = {
            start: new Date(start),
            end: end ? new Date(end) : new Date(),
            fuel_type
        }
        return this.requestService.findByDate(search, paginationDto);
    }

    update(id: number, updateRequestDto: UpdateRequestDtoAndroid) {
        return this.requestService.update(id, updateRequestDto);
    }

    receivedRequest(id: number,time:ReceiveTimeEnum) {
        return this.requestService.receivedRequest(id,time);
    }

    createRequestDetails() {
        return this.requestService.createRequestDetails()
    }
    getRequestTankerInfo(id: number) {
        return this.tankerService.findByRequestIdAndroid(id)
    }
    removeRequest(requestId: number) {
        return this.requestService.remove(requestId)
    }
    // user routes

    addSubUser(addSubUserDto:AddSubUserDto) {
        return this.userService.addSubUsers(addSubUserDto);
    }

    profile() {
        return this.userService.profile();
    }

    updateSubUserMobile(id: number, updateMobileDto: UpdateMobileDtoAndroid) {
        return this.userService.updateSubUserMobile(id, updateMobileDto);
    }

    updateMyPhone(updateMobileDto: UpdateMobileDtoAndroid) {
        return this.userService.updateMyPhone(updateMobileDto);
    }

    removeSubUser(id: number) {
        return this.userService.removeSubUser(id);
    }

    verifyUpdateMobile(code: string) {
        console.log();
        return this.userService.verifyUpdateMobile(code);
    }

    mySubUsers() {
        console.log();
        return this.userService.mySubUsers();
    }
    async findAllNotifications(paginationDto: PaginationDto) {
        try {
            const { id, parentId } = this.req.user
            const { limit, page, skip } = paginationSolver(paginationDto)
            let where: object
            console.log(parentId);
            if (parentId == null) {
                where = { parentId: id }
            }else{ 
                where ={ userId: id, parentId }
            }
            const [notifications, count] = await this.notificationRepository.findAndCount({
                where,
                take: limit,
                skip
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: notifications
            }
        } catch (error) {
            throw error
        }
    }
}