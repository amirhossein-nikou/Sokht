import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { And, Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { StationService } from '../station/services/station.service';
import { PriorityEnum } from './enums/priority.enum';
import { RequestMessages } from './enums/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { StatusEnum } from 'src/common/enums/status.enum';
import { DepotService } from '../depot/depot.service';
import { StationEntity } from '../station/entity/station.entity';
import { FormatDateTime } from 'src/common/utils/formatDate.utils';
import { ReceiveTimeEnum } from './enums/time.enum';
import e, { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { FuelTypes } from 'src/common/enums/fuelType.enum';
import { UserRole } from '../user/enum/role.enum';
import { SearchDto } from './dto/search.dto';
import { InventoryService } from '../station/services/inventory.service';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
    constructor(
        @InjectRepository(RequestEntity) private requestRepository: Repository<RequestEntity>,
        private stationService: StationService,
        private depotService: DepotService,
        private inventoryService: InventoryService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createRequestDto: CreateRequestDto) {
        try {
            const { fuel_type, stationId, value, depotId, receive_at, inventoryId } = createRequestDto
            // check exists station
            const now = FormatDateTime(new Date());
            // if (now > ReceiveTimeEnum.FOUR_PM || now < ReceiveTimeEnum.SEVEN_AM) throw new BadRequestException(`requests can be created from 07:00 until 16:00`)
            // if (receive_at < now) throw new BadRequestException(`receive_at must be more than ${now}`)
            const station = await this.stationService.findOneByIdWithRelations(stationId, {
                inventory: true,
                average_sale: true,
                requests: true
            })
            const inventory = await this.inventoryService.findById(inventoryId)
            if ((inventory.value + value) > inventory.max) throw new BadRequestException('you cant receive more than your max capacity')
            // limit send requests just 4 time in day
            this.limitSendRequests(station)
            //---
            const priority = this.detectPriority(station, fuel_type)
            // check exists depot
            await this.depotService.findOneById(depotId)
            const request = this.requestRepository.create({
                fuel_type,
                stationId,
                value,
                priority: PriorityEnum.High,
                depotId,
                receive_at
            })
            await this.requestRepository.save(request);
            return {
                statusCode: HttpStatus.CREATED,

                message: RequestMessages.Create,
                // priorityDates: {
                //     average_sale_date: station.average_sale.updated_at,
                //     inventory_date: station.inventory.updated_at
                // }

            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const { id: userId, role } = this.req.user
            let where: object = {
                station: {
                    ownerId: userId
                }
            }
            if (role === UserRole.HeadUser) {
                where = {}
            }
            const requests = await this.requestRepository.find({
                where,
                order: {
                    receive_at: 'ASC',
                    priority: 'ASC'
                }
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
            const { id: userId, role } = this.req.user
            let where: object = {
                id,
                station: {
                    ownerId: userId
                }
            }
            if (role === UserRole.HeadUser) {
                where = { id }
            }
            const request = await this.requestRepository.findOne({ where })
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
            const { id: userId, role } = this.req.user
            let where: object = {
                created_at: Between(start, end),
                station: {
                    ownerId: userId
                }
            }
            if (role === UserRole.HeadUser) {
                where = { created_at: Between(start, end) }
            }
            const request = await this.requestRepository.find({
                where: { created_at: And(MoreThanOrEqual(start), LessThanOrEqual(end)) },
                order: {
                    receive_at: 'ASC',
                    priority: 'ASC'
                }
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
            const requests = await this.requestRepository.findBy({ stationId })
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
            const request = await this.getOneById(id)
            const updateObject = RemoveNullProperty({ receive_at, value, })
            //calculate priority => 
            const station = await this.stationService.findOneByIdWithRelations(request.stationId, {
                inventory: true,
                average_sale: true,
                requests: true
            })
            const priority = this.detectPriority(station, request.fuel_type)
            const updatedRequest = await this.requestRepository.update(id, {
                status: StatusEnum.Posted,
                priority
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
            const request = await this.getOneById(id)
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
        try {
            const request = await this.getOneById(id)
            if ([StatusEnum.Approved, StatusEnum.Licensing].includes(request.status)) {
                throw new BadRequestException(RequestMessages.Approved)
            }
            request.status = StatusEnum.Approved
            await this.requestRepository.save(request)
            return {
                statusCode: HttpStatus.OK,

                message: RequestMessages.ApprovedSuccess

            }
        } catch (error) {
            throw error
        }
    }
    async licenseRequest(id: number) {
        try {
            const request = await this.getOneById(id)
            if (request.status == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.status == StatusEnum.Licensing) throw new BadRequestException(RequestMessages.Licensed)
            request.status = StatusEnum.Licensing
            await this.requestRepository.save(request)
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
            if (request.status == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.status == StatusEnum.Approved) throw new BadRequestException(RequestMessages.LicenseFirst)
            if (request.status == StatusEnum.received) throw new BadRequestException(RequestMessages.AlreadyReceived)
            request.status = StatusEnum.received
            await this.requestRepository.save(request)
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.Received
            }
        } catch (error) {
            throw error
        }
    }

    // utils
    detectPriority(station: StationEntity, fuel_type: FuelTypes): PriorityEnum {
        const inventories = station.inventory.filter(inventory => inventory.fuel_type == fuel_type)
        const average_sale = station.average_sale.find(sale => sale.fuel_type = fuel_type)
        if (!inventories || inventories.length == 0)
            throw new BadRequestException('station inventory is invalid')
        if (!average_sale || !average_sale.average_sale)
            throw new BadRequestException('station average_sale is invalid')
        const inventory = inventories.reduce((sum, inventory) => sum + Number(inventory.value), 0);
        const priorityNumber: number = (inventory / average_sale.average_sale) * 100
        if (priorityNumber >= 100) return PriorityEnum.Normal
        else if (priorityNumber < 100 && priorityNumber >= 30) return PriorityEnum.High
        else if (priorityNumber < 30) return PriorityEnum.Critical
        return
    }
    async getOneById(id: number) {
        const request = await this.requestRepository.findOneBy({ id })
        if (!request) throw new NotFoundException(RequestMessages.Notfound)
        return request
    }
    limitSendRequests(station: StationEntity) {
        const now = new Date().toISOString().split('T')[0]
        let counter = 0
        station.requests.forEach(request => {
            const created_at = request.created_at.toISOString().split('T')[0];
            if (now == created_at) counter++
        })
        if (counter >= 4) throw new BadRequestException('cant send more than 4')
    }

}
