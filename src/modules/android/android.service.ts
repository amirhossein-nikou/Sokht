import { PaginationDto } from "src/common/dto/pagination.dto";
import { CreateRequestDtoAndroid } from "../request/dto/create-request.dto";
import { SearchDtoAndroid, SearchWithFuelAndReceiveDtoAndroid } from "../request/dto/search.dto";
import { UpdateRequestDtoAndroid } from "../request/dto/update-request.dto";
import { RequestServiceAndroid } from "../request/request.android.service";
import { UpdateValueAndroid } from "../station/dto/inventory.dto";
import { InventoryService } from "../station/services/inventory.service";
import { TankerService } from "../tanker/tanker.service";
import { AddSubUserDtoAndroid } from "../user/dto/create-user.dto";
import { UpdateMobileDtoAndroid } from "../user/dto/update-user.dto";
import { UserServiceAndroid } from "../user/user.android.service";
import { Injectable } from "@nestjs/common";
import { HomeService } from "../home/home.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class AndroidService {
    constructor(
        private userService: UserServiceAndroid,
        private inventoryService: InventoryService,
        private requestService: RequestServiceAndroid,
        private tankerService: TankerService,
        private homeService: HomeService,
        private notificationService: NotificationService,
    ) { }
    showDashboard() {
        return this.homeService.dashboard()
    }
    updateValueAndroid(id: number, updateValue: UpdateValueAndroid) {
        console.log(updateValue);
        return this.inventoryService.updateValueAndroid(id, updateValue);
    }
    findAllInventories(paginationDto: PaginationDto) {
        return this.inventoryService.findAll(paginationDto)
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

    receivedRequest(id: number) {
        return this.requestService.receivedRequest(id);
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

    addSubUser(addSubUserDto: AddSubUserDtoAndroid) {
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
    findAllNotifications(paginationDto: PaginationDto) {
        return this.notificationService.findAllRoute(paginationDto)
    }
}