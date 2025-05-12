import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { StatusEnum } from 'src/common/enums/status.enum';
import { FormatDateTime } from 'src/common/utils/formatDate.utils';
import { requestOrder } from 'src/common/utils/order-by.utils';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { And, Between, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CargoEntity } from '../cargo/entities/cargo.entity';
import { DepotService } from '../depot/depot.service';
import { InventoryService } from '../station/services/inventory.service';
import { SaleService } from '../station/services/sale.service';
import { StationService } from '../station/services/station.service';
import { UserRole } from '../user/enum/role.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { SearchDto } from './dto/search.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestEntity } from './entities/request.entity';
import { StatusEntity } from './entities/status.entity';
import { RequestMessages } from './enums/message.enum';
import { PriorityEnum } from './enums/priority.enum';
import { ReceiveTimeEnum } from './enums/time.enum';
import { PriorityType } from './types/priority.type';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
    constructor(
        @InjectRepository(RequestEntity) private requestRepository: Repository<RequestEntity>,
        @InjectRepository(StatusEntity) private statusRepository: Repository<StatusEntity>,
        @InjectRepository(CargoEntity) private cargoRepository: Repository<CargoEntity>,
        private stationService: StationService,
        private inventoryService: InventoryService,
        private saleService: SaleService,
        private depotService: DepotService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createRequestDto: CreateRequestDto) {
        try {
            const { fuel_type, stationId, value, depotId, receive_at } = createRequestDto
            await this.insertStatus()
            // check exists station
            const now = FormatDateTime(new Date());
            //if (now > ReceiveTimeEnum.FOUR_PM || now < ReceiveTimeEnum.SEVEN_AM) throw new BadRequestException(`requests can be created from 07:00 until 16:00`)
            // if (receive_at < now) throw new BadRequestException(`receive_at must be more than ${now}`)
            const station = await this.stationService.findOneById(stationId)
            //check fuel type
            await this.stationService.checkExistsFuelType(station.id, fuel_type)
            await this.manageReceivedAt(station.id, receive_at, fuel_type)
            //
            await this.filterRequestValue(station.id, fuel_type, value)
            // limit send requests just 4 time in day
            await this.limitSendRequests(station.id)
            //---
            const priority = await this.detectPriority(station.id, fuel_type)
            // check exists depot
            await this.depotService.findOneById(depotId)
            const request = this.requestRepository.create({
                fuel_type,
                stationId,
                value,
                priority: priority.priority,
                priority_value: priority.priority_value,
                statusId: StatusEnum.Posted,
                depotId,
                receive_at
            })
            await this.requestRepository.save(request);
            return {
                statusCode: HttpStatus.CREATED,
                message: RequestMessages.Create,
            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const { id: userId, role, parentId } = this.req.user
            let where: object = {
                status: In([0,1,2]),
                station: {
                    ownerId: parentId ?? userId
                }
            }
            if (role !== UserRole.StationUser) {
                where = {status: In([0,1,2])}
            }
            const requests = await this.requestRepository.find({
                where,
                relations: {
                    depot: true,
                },
                order: requestOrder
            })

            return {
                statusCode: HttpStatus.OK,
                data: requests
            }
        } catch (error) {
            throw error
        }
    }

    async findOne(id: number) {
        try {
            const { id: userId, role, parentId } = this.req.user
            let where: object = {
                id,
                station: {
                    ownerId: parentId ?? userId
                }
            }
            if (role !== UserRole.StationUser) {
                where = { id }
            }
            const request = await this.requestRepository.findOne({
                where,
                relations: {
                    depot: true,
                },
            })
            if (!request) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: request
            }
        } catch (error) {
            throw error
        }
    }
    async findByDate(search: SearchDto) {
        try {
            let { start, end } = search
            if (start > end) throw new BadRequestException('start date must be bigger than end date')
            end = new Date(end.getTime() + (1 * 1000 * 60 * 60 * 24));
            const { id: userId, role, parentId } = this.req.user
            let where: object = {
                created_at: And(MoreThanOrEqual(start), LessThanOrEqual(end)),
                station: {
                    ownerId: parentId ?? userId
                }
            }
            if (role !== UserRole.StationUser) {
                where = { created_at: And(MoreThanOrEqual(start), LessThanOrEqual(end)) }
            }
            const request = await this.requestRepository.find({
                where,
                relations: {
                    depot: true,
                },
                order: requestOrder
            })
            if (!request) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: request
            }
        } catch (error) {
            throw error
        }
    }
    async findStationRequests(stationId: number) {
        try {
            const requests = await this.requestRepository.findOne({
                where: { stationId }, relations: {
                    depot: true,
                },
            })
            if (!requests) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: requests
            }
        } catch (error) {
            throw error
        }
    }

    async update(id: number, updateRequestDto: UpdateRequestDto) {
        try {
            const { value, receive_at } = updateRequestDto
            const request = await this.getOneByIdForUpdateAndRemove(id)
            const updateObject = RemoveNullProperty({ receive_at, value, })
            //calculate priority => 
            const station = await this.stationService.findOneById(request.stationId)
            const priority = await this.detectPriority(station.id, request.fuel_type)
            const updatedRequest = await this.requestRepository.update(id, {
                statusId: StatusEnum.Posted,
                priority: priority.priority,
                priority_value: priority.priority_value
                , ...updateObject
            })
            if (!updatedRequest || updatedRequest.affected == 0) throw new BadRequestException(RequestMessages.UpdateFailed)
            return {
                statusCode: HttpStatus.OK,

                message: RequestMessages.Update

            }
        } catch (error) {
            throw error
        }
    }

    async remove(id: number) {
        try {
            const request = await this.getOneByIdForUpdateAndRemove(id)
            await this.requestRepository.remove(request)
            return {
                statusCode: HttpStatus.OK,

                message: RequestMessages.Remove

            }
        } catch (error) {
            throw error
        }
    }

    async approvedRequest(id: number) {
        const request = await this.getOneById(id)
        if ([StatusEnum.Approved, StatusEnum.Licensing].includes(request.statusId)) {
            throw new BadRequestException(RequestMessages.Approved)
        }

        await this.requestRepository.update(id, { statusId: StatusEnum.Approved })
        return {
            statusCode: HttpStatus.OK,
            message: RequestMessages.ApprovedSuccess
        }
    }
    async licenseRequest(id: number) {
        try {
            const request = await this.getOneById(id)
            if (request.statusId == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.statusId == StatusEnum.Licensing) throw new BadRequestException(RequestMessages.Licensed)
            await this.requestRepository.update(id, { statusId: StatusEnum.Licensing })
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.LicenseSuccess
            }
        } catch (error) {
            throw error
        }
    }
    async receivedRequest(id: number) {
        try {
            const request = await this.getOneById(id)
            if (request.statusId == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.statusId == StatusEnum.Approved) throw new BadRequestException(RequestMessages.LicenseFirst)
            if (request.statusId == StatusEnum.received) throw new BadRequestException(RequestMessages.AlreadyReceived)
            await this.cargoRepository.update(request.cargo.id, { inProgress: false })
            await this.requestRepository.update(id, { statusId: StatusEnum.received })
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.Received
            }
        } catch (error) {
            throw error
        }
    }
    async createRequestDetails() {
        try {
            const { id, parentId } = this.req.user
            const station = await this.stationService.findByUserId(parentId ?? id)
            const depots = await this.depotService.getNameList()
            const receiveTimes = Object.values(ReceiveTimeEnum);
            const stationFuels = station.fuels
            const capacityList = []
            const promise = stationFuels.map(async item => {
                const contain = await this.getSumValueForInventory(station.id, item.id)
                const maxCap = await this.getMaxInventoryCapacity(station.id, item.id)
                if (contain && maxCap) {
                    const availableValue = (maxCap - contain) * 1.2
                    capacityList.push({ availableValue, fuel_type: item.name })
                }
            })
            await Promise.all(promise)
            if (capacityList.length == 0) throw new BadRequestException('something went wrong in capacity')
            return {
                statusCode: HttpStatus.OK,
                data: {
                    depots,
                    receiveTimes,
                    stationFuels,
                    capacityList
                }
            }
        } catch (error) {
            throw error
        }
    }
    // utils
    async detectPriority(stationId: number, fuel_type: number,): Promise<PriorityType> {
        const inventories = await this.getSumValueForInventory(stationId, fuel_type)
        const average_sale = await this.getSumValueForSale(stationId, fuel_type)
        if (!inventories)
            throw new BadRequestException('station inventory is invalid')
        if (!average_sale)
            throw new BadRequestException('station average_sale is invalid')
        const priorityNumber: number = (inventories / average_sale) * 100
        if (priorityNumber >= 100) {
            return {
                priority: PriorityEnum.Normal,
                priority_value: priorityNumber
            }
        }
        else if (priorityNumber < 100 && priorityNumber >= 30) {
            return { priority: PriorityEnum.High, priority_value: priorityNumber }
        }
        else if (priorityNumber < 30) {
            return { priority: PriorityEnum.Critical, priority_value: priorityNumber }
        }
    }
    async filterRequestValue(stationId: number, fuel_type: number, value: number) {
        const inventoryValueSum = await this.getSumValueForInventory(stationId, fuel_type)
        if (!inventoryValueSum) throw new BadRequestException('inventory is invalid')
        const maxCap = await this.getMaxInventoryCapacity(stationId, fuel_type)
        const maxValues = inventoryValueSum + Number(value)
        if (value < 1000) throw new BadRequestException('request value must be more than 1000')
        if (maxValues > (maxCap * 1.2))
            throw new BadRequestException('you cant receive more than your max capacity')
        return {
            inventoryValueSum,
            maxCap
        }
    }
    async getOneById(id: number) {
        const request = await this.requestRepository.findOne({ where: { id }, relations: { cargo: true } })
        if (!request) throw new NotFoundException(RequestMessages.Notfound)
        return request
    }
    private async getOneByIdForUpdateAndRemove(id: number) {
        const request = await this.requestRepository.findOneBy({ id })
        if (!request) throw new NotFoundException(RequestMessages.Notfound)
        if (request.statusId != 0) throw new BadRequestException('you cant update or remove on this status')
        return request
    }
    async limitSendRequests(stationId: number) {
        const now = new Date(new Date().toISOString().split('T')[0])
        const end = new Date(now.getTime() + (1 * 1000 * 60 * 60 * 24));
        const request = await this.requestRepository.find({
            where: {
                created_at: Between(now, end),
                stationId
            },
        })
        if (request.length >= 4) throw new BadRequestException('cant send more than 4')
        // //const now = new Date().toISOString().split('T')[0]
        // let counter = 0
        // station.requests.forEach(request => {
        //     const created_at = request.created_at.toISOString().split('T')[0];
        //     if (now == created_at) counter++
        // })
    }
    async checkExistsStatus(statusId: number) {
        const status = await this.statusRepository.findOneBy({ id: statusId })
        if (status) throw new BadRequestException('status already exists')
    }
    async createStatus(id: number, title: string) {
        const status = await this.statusRepository.findOneBy({ id })
        if (status) return
        const result = this.statusRepository.create({ id, status: title })
        await this.statusRepository.save(result)
        return 'created'
    }
    async insertStatus() {
        await this.createStatus(StatusEnum.Posted, "در انتظار تایید")
        await this.createStatus(StatusEnum.Licensing, 'صدور پروانه و ارسال نفت کش')
        await this.createStatus(StatusEnum.Approved, "تایید شده")
        await this.createStatus(StatusEnum.received, "دریافت شده")
    }
    async getSumValueForInventory(stationId: number, fuel_type) {
        const inventories = await this.inventoryService.findByStationIdAndFuel(stationId, fuel_type)
        const sumValue = inventories.reduce((sum, inventory) => sum + Number(inventory.value), 0);
        return sumValue
    }
    async getMaxInventoryCapacity(stationId: number, fuel_type) {
        const inventories = await this.inventoryService.findByStationIdAndFuel(stationId, fuel_type)
        const sumValue = inventories.reduce((sum, inventory) => sum + Number(inventory.max), 0);
        return sumValue
    }
    async getSumValueForSale(stationId: number, fuel_type) {
        const sales = await this.saleService.findByStationIdAndFuel(stationId, fuel_type)
        return sales.average_sale
    }
    async manageReceivedAt(stationId: number, receive_at: ReceiveTimeEnum, fuel_type: number) {
        const start = new Date(new Date().toISOString().split('T')[0])
        const end = new Date(start.getTime() + (1 * 1000 * 60 * 60 * 24));
        const request = await this.requestRepository.findOne({
            where: { stationId, receive_at, fuel_type, created_at: Between(start, end) }
        })
        if (request) throw new BadRequestException('this received Time is already used for this fuel')
    }
}
