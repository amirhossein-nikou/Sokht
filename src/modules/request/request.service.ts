import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RejectDto } from 'src/common/dto/create-reject.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { StatusEnum } from 'src/common/enums/status.enum';
import { CreateNumber } from 'src/common/utils/create-number.utils';
import { FormatDateTime } from 'src/common/utils/formatDate.utils';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Between, In, Repository } from 'typeorm';
import { CargoEntity } from '../cargo/entities/cargo.entity';
import { DepotService } from '../depot/depot.service';
import { FuelTypeService } from '../fuel-type/fuel-type.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { InventoryService } from '../station/services/inventory.service';
import { SaleService } from '../station/services/sale.service';
import { StationService } from '../station/services/station.service';
import { TankerService } from '../tanker/tanker.service';
import { UserRole } from '../user/enum/role.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { SearchDto, SearchWithFuelAndReceiveDto } from './dto/search.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestEntity } from './entities/request.entity';
import { StatusEntity } from './entities/status.entity';
import { RequestMessages } from './enums/message.enum';
import { PriorityEnum } from './enums/priority.enum';
import { ReceiveTimeEnum } from './enums/time.enum';
import { PriorityType } from './types/priority.type';
import { FuelTypeEnum } from 'src/common/enums/fuelType.enum';

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
        private notification: NotificationGateway,
        private fuelService: FuelTypeService,
        private tankerService: TankerService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createRequestDto: CreateRequestDto) {
        try {
            console.log(`access -> ${this.req.url}`);
            const { fuel_type, value, depotId, receive_at } = createRequestDto
            const { id: userId, parentId } = this.req.user
            await this.fuelService.insertFuelType()
            await this.insertStatus()
            const fuel = await this.fuelService.getById(fuel_type)
            await this.fuelService.checkUpdateLimit()
            if (fuel.limit && value > fuel.limit) {
                throw new BadRequestException(`you cant request more than ${fuel.limit}`)
            }
            if (!fuel.available_value.includes(Number(value)))
                throw new BadRequestException(`request value for this fuel cna be following values -> [${fuel.available_value}]`)
            // check exists station
            const now = FormatDateTime(new Date());
            //if (now > ReceiveTimeEnum.FOUR_PM || now < ReceiveTimeEnum.SEVEN_AM) throw new BadRequestException(`requests can be created from 07:00 until 16:00`)
            // if (receive_at < now) throw new BadRequestException(`receive_at must be more than ${now}`)
            const station = await this.stationService.findByUserId(parentId ?? userId)
            //check fuel type
            await this.stationService.checkExistsFuelType(station.id, fuel_type)
            //await this.manageReceivedAt(station.id, receive_at, fuel_type)

            await this.filterRequestValue(station.id, fuel_type, value)
            // limit send requests just 4 time in day
            await this.limitSendRequests(station.id)
            //---
            const priority = await this.detectPriority(station.id, fuel_type)
            // check exists depot
            await this.depotService.findOneById(depotId)
            let number = CreateNumber(fuel_type)
            let isExistsNumber = await this.checkExistsNumber(number)
            while (isExistsNumber == true) {
                number = CreateNumber(fuel_type)
                isExistsNumber = await this.checkExistsNumber(number)
            }
            const request = this.requestRepository.create({
                fuel_type,
                stationId: station.id,
                value,
                priority: priority.priority,
                priority_value: priority.priority_value,
                statusId: StatusEnum.Posted,
                depotId,
                receive_at,
                number
            })
            const result = await this.requestRepository.save(request);
            await this.notification.notificationHandler({
                title: `پرسنل ${station.owner.first_name} ${station.owner.last_name} یک درخواست جدید به شماره ${request.id} و به مقدار ${request.value} لیتر سوخت ${fuel.name} ایجاد کرد`,
                description: 'no description',
                userId: userId,
                parentId: parentId
            })
            return {
                statusCode: HttpStatus.CREATED,
                message: RequestMessages.Create,
                data: result
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async findAll(paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id: userId, role, parentId } = this.req.user
            let whereQuery = `(request.statusId IN (0, 1, 2, 3) AND request.rejectDetails IS NULL AND station.ownerId = :ownerId)`
            if (role !== UserRole.StationUser) {
                whereQuery = `(request.statusId IN (0, 1, 2, 3) AND request.rejectDetails IS NULL)`
            }
            const [requests, count] = await this.requestRepository.createQueryBuilder('request')
                .leftJoinAndSelect('request.depot', 'depot')
                .leftJoinAndSelect('request.status', 'status')
                .leftJoinAndSelect('request.station', 'station')
                .leftJoinAndSelect('request.cargo', 'cargo')
                .leftJoinAndSelect('cargo.tankers', 'tankers')
                .leftJoinAndSelect('tankers.driver', 'driver')
                .leftJoinAndSelect('request.fuel', 'fuel')
                .select([
                    'request.id', 'request.number', 'depot.name', 'depot.id', 'cargo.id', 'request.fuel_type', 'fuel.name', 'tankers',
                    'driver.first_name', 'driver.last_name', 'driver.mobile', 'driver.national_code', 'driver.id',
                    'request.value', 'request.receive_at', 'request.priority', 'status.status',
                    'request.created_at', 'request.statusId', 'request.stationId', 'request.priority_value'
                ])
                .where(whereQuery, { ownerId: parentId ?? userId })
                .orderBy('request.receive_at', 'ASC')
                .addOrderBy('request.priority_value', 'ASC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: requests
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findPendingApprove(paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id: userId, role, parentId } = this.req.user
            let whereQuery = `(request.statusId IN (0) AND request.rejectDetails IS NULL AND station.ownerId = :ownerId)`
            if (role !== UserRole.StationUser) {
                whereQuery = `(request.statusId IN (0) AND request.rejectDetails IS NULL)`
            }
            const [requests, count] = await this.requestRepository.createQueryBuilder('request')
                .leftJoinAndSelect('request.depot', 'depot')
                .leftJoinAndSelect('request.status', 'status')
                .leftJoinAndSelect('request.station', 'station')
                .leftJoinAndSelect('depot.tankers', 'tankers')
                .leftJoinAndSelect('request.fuel', 'fuel')
                .select([
                    'request.id', 'request.number', 'depot.name', 'request.fuel_type', 'fuel.name', 'tankers',
                    'request.value', 'request.receive_at', 'request.priority', 'status.status',
                    'request.created_at', 'request.statusId', 'request.stationId', 'request.priority_value'
                ])
                .where(whereQuery, { ownerId: parentId ?? userId })
                .orderBy('request.receive_at', 'ASC')
                .addOrderBy('request.priority_value', 'ASC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: requests
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findByStatus(statusId: number, paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id: userId, role, parentId } = this.req.user
            let whereQuery = `(request.statusId = :statusId AND request.rejectDetails IS NULL AND station.ownerId = :ownerId)`
            if (role !== UserRole.StationUser) {
                whereQuery = `(request.statusId = :statusId AND request.rejectDetails IS NULL)`
            }
            const [requests, count] = await this.requestRepository.createQueryBuilder('request')
                .leftJoinAndSelect('request.depot', 'depot')
                .leftJoinAndSelect('request.status', 'status')
                .leftJoinAndSelect('request.station', 'station')
                .leftJoinAndSelect('request.cargo', 'cargo')
                .leftJoinAndSelect('cargo.tankers', 'tankers')
                .leftJoinAndSelect('tankers.driver', 'driver')
                .leftJoinAndSelect('request.fuel', 'fuel')
                .select([
                    'request.id', 'request.received_time', 'request.number', 'depot.name', 'depot.id', 'cargo.id', 'request.fuel_type', 'fuel.name', 'tankers',
                    'driver.first_name', 'driver.last_name', 'driver.mobile', 'driver.national_code', 'driver.id',
                    'request.value', 'request.receive_at', 'request.priority', 'status.status',
                    'request.created_at', 'request.statusId', 'request.stationId', 'request.priority_value'
                ])
                .where(whereQuery, { ownerId: parentId ?? userId, statusId })
                .orderBy('request.receive_at', 'ASC')
                .addOrderBy('request.priority_value', 'ASC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: requests
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findOne(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
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
                    cargo: true,
                    station: {
                        owner: true
                    }
                },
                select: {
                    station: {
                        id: true,
                        name: true,
                        owner: {
                            id: true, first_name: true, last_name: true, mobile: true, national_code: true, certificateId: true
                        }
                    }
                }
            })
            if (!request) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: request
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findByFuelType(searchWithFuelAndReceiveDto: SearchWithFuelAndReceiveDto, paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { fuel_type, receive_at } = searchWithFuelAndReceiveDto
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id: userId, role, parentId } = this.req.user
            let whereQuery = `(request.fuel_type = :fuel_type AND request.rejectDetails IS NULL AND station.ownerId = :ownerId)`
            if (role !== UserRole.StationUser) {
                whereQuery = `(request.fuel_type = :fuel_type AND request.rejectDetails IS NULL)`
            }
            if (receive_at) {
                whereQuery += ` AND request.receive_at = :receive_at`
            }
            const [requests, count] = await this.requestRepository.createQueryBuilder('request')
                .leftJoinAndSelect('request.depot', 'depot')
                .leftJoinAndSelect('request.status', 'status')
                .leftJoinAndSelect('request.station', 'station')
                .leftJoinAndSelect('request.cargo', 'cargo')
                .leftJoinAndSelect('cargo.tankers', 'tankers')
                .leftJoinAndSelect('tankers.driver', 'driver')
                .leftJoinAndSelect('request.fuel', 'fuel')
                .select([
                    'request.id', 'request.number', 'depot.name', 'depot.id', 'cargo.id', 'request.fuel_type', 'fuel.name', 'tankers',
                    'driver.first_name', 'driver.last_name', 'driver.mobile', 'driver.national_code', 'driver.id',
                    'request.value', 'request.receive_at', 'request.priority', 'status.status',
                    'request.created_at', 'request.statusId', 'request.stationId', 'request.priority_value'
                ])
                .where(whereQuery, { ownerId: parentId ?? userId, fuel_type, receive_at })
                .orderBy('request.receive_at', 'ASC')
                .addOrderBy('request.priority_value', 'ASC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            // const [requests, count] = await this.requestRepository.findAndCount({
            //     where,
            //     relations: {
            //         depot: { location: true },
            //     },
            //     order: requestOrder,
            //     select: {
            //         id: true,
            //         depot: { name: true },
            //         fuel_type: true,
            //         fuel: { name: true },
            //         value: true,
            //         receive_at: true,
            //         status: { status: true },
            //         statusId: true,
            //         stationId: true,
            //         created_at: true
            //     },
            //     //take: limit,
            //     skip
            // })
            //if (requests.length <= 0) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: requests
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findByDate(search: SearchDto, paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            let { start, end, fuel_type } = search
            if (start > end) throw new BadRequestException('start date must be bigger than end date')
            end = new Date(end.getTime() + (1 * 1000 * 60 * 60 * 24));
            const { id: userId, role, parentId } = this.req.user
            let whereQuery = `(request.created_at BETWEEN :start AND :end AND station.ownerId = :ownerId)`
            // let where: object = {
            //     created_at: And(MoreThanOrEqual(start), LessThanOrEqual(end)),
            //     station: {
            //         ownerId: parentId ?? userId
            //     }
            // }
            if (role !== UserRole.StationUser) {
                //where = { created_at: And(MoreThanOrEqual(start), LessThanOrEqual(end)) }
                whereQuery = `(request.created_at BETWEEN :start AND :end)`
            }
            if (fuel_type) whereQuery += 'AND request.fuel_type = :fuel_type'
            const [requests, count] = await this.requestRepository.createQueryBuilder('request')
                .leftJoinAndSelect('request.depot', 'depot')
                .leftJoinAndSelect('request.status', 'status')
                .leftJoinAndSelect('request.station', 'station')
                .leftJoinAndSelect('request.cargo', 'cargo')
                .leftJoinAndSelect('cargo.tankers', 'tankers')
                .leftJoinAndSelect('tankers.driver', 'driver')
                .leftJoinAndSelect('request.fuel', 'fuel')
                .select([
                    'request.id', 'request.number', 'depot.name', 'depot.id', 'cargo.id', 'request.fuel_type', 'fuel.name', 'tankers',
                    'driver.first_name', 'driver.last_name', 'driver.mobile', 'driver.national_code', 'driver.id',
                    'request.value', 'request.receive_at', 'request.priority', 'status.status',
                    'request.created_at', 'request.statusId', 'request.stationId', 'request.priority_value'
                ])
                .where(whereQuery, { ownerId: parentId ?? userId, start, end, fuel_type })
                .orderBy('request.receive_at', 'ASC')
                .addOrderBy('request.priority_value', 'ASC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            // const [request, count] = await this.requestRepository.findAndCount({
            //     where,
            //     relations: {
            //         depot: true,
            //     },
            //     order: requestOrder,
            //     //take: limit,
            //     skip
            // })
            //if (!request) throw new NotFoundException(RequestMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: requests
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async update(id: number, updateRequestDto: UpdateRequestDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { value, receive_at } = updateRequestDto
            const request = await this.getOneByIdForUpdateAndRemove(id)
            const updateObject = RemoveNullProperty({ receive_at, value, })
            const station = await this.stationService.findOneById(request.stationId)
            if (value) {
                const fuel = await this.fuelService.getById(request.fuel_type)
                if (!fuel.available_value.includes(value))
                    throw new BadRequestException(`request value for this fuel cna be following values -> [${fuel.available_value}]`)
                await this.filterRequestValue(station.id, request.fuel_type, value)
            }
            const priority = await this.detectPriority(station.id, request.fuel_type)
            const updatedRequest = await this.requestRepository.update(id, {
                statusId: StatusEnum.Posted,
                priority: priority.priority,
                priority_value: priority.priority_value
                , ...updateObject
            })
            if (!updatedRequest || updatedRequest.affected == 0) throw new BadRequestException(RequestMessages.UpdateFailed)
            const result = await this.getOneByIdForUpdateAndRemove(id)
            return {
                statusCode: HttpStatus.OK,
                data: result,
                message: RequestMessages.Update

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async updateOnCreateCargo(id: number, updateRequestDto: UpdateRequestDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { value, receive_at } = updateRequestDto
            const request = await this.getOneById(id)
            const updateObject = RemoveNullProperty({ receive_at, value, })
            const station = await this.stationService.findOneById(request.stationId)
            if (value) await this.filterRequestValue(station.id, request.fuel_type, value)
            const priority = await this.detectPriority(station.id, request.fuel_type)
            const updatedRequest = await this.requestRepository.update(id, {
                //statusId: StatusEnum.Posted,
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
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async remove(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const request = await this.getOneByIdForUpdateAndRemove(id)
            await this.requestRepository.remove(request)
            return {
                statusCode: HttpStatus.OK,

                message: RequestMessages.Remove

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async approvedRequest(id: number) {
        const request = await this.getOneById(id)
        try {
            console.log(`access  -> ${this.req.url}`);
            if ([StatusEnum.Approved, StatusEnum.Licensing].includes(request.statusId)) {
                throw new BadRequestException(RequestMessages.Approved)
            }
            await this.requestRepository.update(id, { statusId: StatusEnum.Approved })
            await this.notification.notificationHandler({
                title: `درخواست ${request.value} لیتر ${request.fuel.name} برای شما به شماره ${request.id} تایید شد`,
                description: `درخواست ${request.value} لیتر ${request.fuel.name} برای شما به شماره ${request.id} برای ساعت ${request.receive_at} روز ${request.created_at} تایید شد`,
                userId: request.station.ownerId,
                parentId: request.station.ownerId,
            })
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.ApprovedSuccess
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            if (request.statusId == StatusEnum.Approved) {
                await this.requestRepository.update(id, { statusId: StatusEnum.Posted })
            }
            throw error
        }
    }
    async licenseRequest(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const request = await this.getOneById(id)
            if (request.statusId == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.statusId == StatusEnum.Licensing) throw new BadRequestException(RequestMessages.Licensed)
            await this.requestRepository.update(id, { statusId: StatusEnum.Licensing })
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.LicenseSuccess
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async sendTankerForRequest(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const request = await this.getOneById(id)
            if (request.statusId == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.statusId == StatusEnum.Licensing) throw new BadRequestException(RequestMessages.LicenseFirst)
            if (request.statusId == StatusEnum.SendTanker) throw new BadRequestException(RequestMessages.SendTanker)

            await this.requestRepository.update(id, { statusId: StatusEnum.Licensing })
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.LicenseSuccess
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async receivedRequest(id: number, time: ReceiveTimeEnum) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const request = await this.getOneById(id)
            console.log(time);
            if (request.statusId == StatusEnum.Posted) throw new BadRequestException(RequestMessages.ApprovedFirst)
            if (request.statusId == StatusEnum.Approved) throw new BadRequestException(RequestMessages.LicenseFirst)
            if (request.statusId == StatusEnum.Received) throw new BadRequestException(RequestMessages.AlreadyReceived)
            if (!request.cargo) throw new NotFoundException('cargo not found')
            await this.cargoRepository.update(request.cargo.id, { inProgress: false })
            await this.requestRepository.update(id, { statusId: StatusEnum.Received, received_time: time })
            await this.tankerService.updateStatusByTakerList(request.cargo.tankers, true)
            return {
                statusCode: HttpStatus.OK,
                message: RequestMessages.Received
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async createRequestDetails() {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id, parentId } = this.req.user
            const station = await this.stationService.findByUserId(parentId ?? id)
            const depots = await this.depotService.getNameList()
            const receiveTimes = Object.values(ReceiveTimeEnum);
            const stationFuels = station.fuels
            const capacityList = []
            const availableFuels = []
            const promise = stationFuels.map(async item => {
                const contain = await this.inventoryService.getSumValueForInventory(station.id, item.id)
                const maxCap = await this.inventoryService.getMaxInventoryCapacity(station.id, item.id)
                const inventory = await this.inventoryService.getAvailableInventory(station.id, item.id)
                if(inventory) availableFuels.push(item)
                if (contain && maxCap) {
                    const availableValue = (maxCap - contain) * 1.2
                    capacityList.push({ availableValue: Math.round(availableValue), fuel_type: item.name })
                }
            })
            await Promise.all(promise)
            if (capacityList.length == 0) throw new BadRequestException('something went wrong in capacity')
            return {
                statusCode: HttpStatus.OK,
                data: {
                    depots,
                    receiveTimes,
                    stationFuels: availableFuels,
                    capacityList
                }
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async rejectRequest(id: number, rejectDto: RejectDto) {
        const request = await this.getOneById(id)
        try {
            console.log(`access  -> ${this.req.url}`);
            const { description, title } = rejectDto
            if (request.rejectDetails || request.statusId === StatusEnum.Reject)
                throw new BadRequestException("this request already rejected")
            if (request.statusId === StatusEnum.Received) throw new BadRequestException('we cant reject Received requests')
            await this.requestRepository.update(id, {
                statusId: StatusEnum.Reject,
                rejectDetails: { title, description }
            })
            await this.notification.notificationHandler({
                title: `درخواست ${request.value} لیتر ${request.fuel.name} برای شما به شماره ${request.id} لغو شد`,
                description: `${title}:${description}`,
                userId: request.station.ownerId,
                parentId: request.station.ownerId
            })
            if (request.cargo) {
                await this.tankerService.updateStatusByTakerList(request.cargo.tankers, true)
            }
            return {
                statusCode: HttpStatus.OK,
                message: "request rejected successfully"
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }

    }
    // utils
    async detectPriority(stationId: number, fuel_type: number,): Promise<PriorityType> {
        const inventories = await this.inventoryService.getSumValueForInventory(stationId, fuel_type)
        const average_sale = await this.getSumValueForSale(stationId, fuel_type)
        if (inventories == undefined)
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
        const inventoryValueSum = await this.inventoryService.getSumValueForInventory(stationId, fuel_type)
        if (inventoryValueSum == undefined) throw new BadRequestException('inventory is invalid')
        const maxCap = await this.inventoryService.getMaxInventoryCapacity(stationId, fuel_type)
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
        const request = await this.requestRepository.findOne({
            where: { id }, relations: {
                cargo: {
                    tankers: true
                }, station: true
            }
        })
        if (!request) throw new NotFoundException(RequestMessages.Notfound)
        return request
    }
    private async getOneByIdForUpdateAndRemove(id: number) {
        const request = await this.requestRepository.findOneBy({ id })
        if (!request) throw new NotFoundException(RequestMessages.Notfound)
        if ([StatusEnum.Approved, StatusEnum.Licensing, StatusEnum.Received].includes(request.statusId)) throw new BadRequestException('you cant update or remove on this status')
        return request
    }
    async limitSendRequests(stationId: number) {
        const now = new Date(new Date().toISOString().split('T')[0])
        const end = new Date(now.getTime() + (1 * 1000 * 60 * 60 * 24));
        const request = await this.requestRepository.find({
            where: {
                created_at: Between(now, end),
                stationId,
                statusId: In([StatusEnum.Approved, StatusEnum.Licensing, StatusEnum.Posted])
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
    async checkExistsNumber(number: string) {
        const request = await this.requestRepository.findOneBy({ number })
        if (request) return true
        return false
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
        await this.createStatus(StatusEnum.Licensing, 'صدور پروانه')
        await this.createStatus(StatusEnum.SendTanker, 'ارسال نفت کش')
        await this.createStatus(StatusEnum.Approved, "تایید شده")
        await this.createStatus(StatusEnum.Received, "دریافت شده")
        await this.createStatus(StatusEnum.Reject, "رد شده")
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
