import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import * as moment from 'moment';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FuelTypeEnum } from 'src/common/enums/fuelType.enum';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { Between, Repository } from 'typeorm';
import { StringToBoolean } from '../../../common/utils/boolean.utils';
import { getIdList } from '../../../common/utils/id.utils';
import { requestOrder } from '../../../common/utils/order-by.utils';
import { StringToArray } from '../../../common/utils/stringToArray.utils';
import { RemoveNullProperty } from '../../../common/utils/update.utils';
import { FuelTypeService } from '../../../modules/fuel-type/fuel-type.service';
import { LocationService } from '../../location/location.service';
import { UserService } from '../../user/user.service';
import { LimitDto } from '../dto/limit.dto';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { LimitEntity } from '../entity/limit.entity';
import { StationEntity } from '../entity/station.entity';
import { StationMessages } from '../enum/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class StationService {
    constructor(
        @InjectRepository(StationEntity) private stationRepository: Repository<StationEntity>,
        @InjectRepository(LimitEntity) private limitRepository: Repository<LimitEntity>,
        private userService: UserService,
        private locationService: LocationService,
        private fuelTypeService: FuelTypeService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createStationDto: CreateStationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { isActive, locationId, name, ownerId, fuel_types } = createStationDto
            //check user exist
            const fuelIdList = getIdList(StringToArray(fuel_types))
            const fuels = await this.fuelTypeService.getByIdList(fuelIdList)
            const user = await this.userService.findOneById(ownerId)
            if (user.parentId) throw new BadRequestException(StationMessages.ParentExists)
            //check location
            await this.locationService.findOne(locationId)
            await this.checkExistsLocation(locationId)
            const station = this.stationRepository.create({
                isActive: StringToBoolean(isActive),
                locationId, name, ownerId,
                //fuel_types: StringToArray(fuel_types),
                fuels
            })
            // add limit => 
            const result = await this.stationRepository.save(station)
            if (fuelIdList.includes(FuelTypeEnum.Diesel)) {
                const limit = await this.AddLimit({ value: 13500, stationId: result.id, by_user: false, date: new Date() })
            }
            return {
                statusCode: HttpStatus.OK,
                message: StationMessages.Created,
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
            const [stations, count] = await this.stationRepository.findAndCount({
                relations: { location: true, fuels: true },
                take: limit,
                skip
            });
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: stations
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findAllChangedLimit(paginationDto: PaginationDto, by_user: boolean, date: string) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const AllStations = await this.stationRepository.find({ where: { fuels: { id: FuelTypeEnum.Diesel } } })
            const promise = AllStations.map(async station => {
                await this.checkUpdateLimit(station.id)
            })
            await Promise.all(promise)
            let start = new Date(new Date().toISOString().split('T')[0])
            if (date) {
                start = new Date(new Date(date).toISOString().split('T')[0])
            }
            let end = new Date(start.getTime() + 1000 * 60 * 60 * 24)
            let where: any = { limit: { by_user, date: Between(start, end) } }
            if (!by_user) where = { limit: { by_user, date: Between(start, end) } }
            if (!date) where = { limit: { by_user } }
            const [stations, count] = await this.stationRepository.findAndCount({
                where,
                relations: { location: true, fuels: true },
                take: limit,
                skip
            });
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: stations
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findOne(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const station = await this.stationRepository.findOne({
                where: { id },
                relations: {
                    location: true,
                    average_sale: true,
                    fuels: true,
                    owner: true
                },
                select: {
                    owner: {
                        id: true, first_name: true, last_name: true, mobile: true, national_code: true, certificateId: true
                    }
                }
            })
            if (!station) throw new NotFoundException(StationMessages.NotFound)
            return {
                statusCode: HttpStatus.OK,
                data: station
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async update(id: number, updateStationDto: UpdateStationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { isActive, locationId, name, ownerId, fuel_types } = updateStationDto
            let fuels
            const station = await this.findOneById(id)
            if (fuel_types) {
                const fuelIdList = getIdList(StringToArray(fuel_types))
                fuels = await this.fuelTypeService.getByIdList(fuelIdList)
                station.fuels = fuels
                await this.stationRepository.save(station)
            }
            const updateObj = RemoveNullProperty({
                locationId, name, ownerId, isActive: StringToBoolean(isActive)
            })
            //check user exist
            if (ownerId) await this.userService.findOneById(ownerId)
            //check location
            if (locationId && locationId != station.locationId) {
                await this.locationService.findOne(locationId)
                await this.checkExistsLocation(locationId)
            }
            if (updateObj)
                await this.stationRepository.update(id, updateObj)
            const result = await this.findOneById(id)
            return {
                statusCode: HttpStatus.CREATED,
                message: StationMessages.Update,
                data: result
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async remove(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const station = await this.findOneById(id)
            await this.stationRepository.remove(station)
            return {
                statusCode: HttpStatus.OK,
                message: StationMessages.Remove

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async stationStatusToggle(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const station = await this.findOneById(id)
            let message = ''
            if (station.isActive) {
                station.isActive = false
                message = 'station status change to false'
            } else {
                station.isActive = true
                message = 'station status change to true'
            }
            await this.stationRepository.save(station)
            return {
                statusCode: HttpStatus.OK,
                message
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async myStation() {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id, parentId } = this.req.user
            const station = await this.stationRepository.find({
                where: { ownerId: parentId ?? id },
                relations: {
                    // requests: {
                    //     cargo: true
                    // },
                    inventory: true,
                    location: true
                },
                order: {
                    requests: requestOrder
                }
            })
            if (!station) throw new NotFoundException(StationMessages.NotFound)
            return {
                statusCode: HttpStatus.OK,
                data: station
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    // utils
    async checkExistsLocation(locationId: number) {
        const station = await this.stationRepository.findOne({ where: { locationId } })
        if (station) throw new ConflictException(StationMessages.ExistsLocation)
        return false
    }
    async findOneById(id: number) {
        const station = await this.stationRepository.findOne({
            where: { id },
            relations: {
                location: true,
                fuels: true
            }
        })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
    async getAllStations() {
        const stations = await this.stationRepository.find({ where: { isActive: true }, relations: { location: true, inventory: true } })
        if (stations.length == 0) throw new NotFoundException(StationMessages.NotFound)
        return stations
    }
    async findByUserStation(userId: number, id: number) {
        const station = await this.stationRepository.findOne({ where: { ownerId: userId, id }, relations: { fuels: true } })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
    async findByUserId(userId: number) {
        const station = await this.stationRepository.findOne({ where: { ownerId: userId }, relations: { fuels: true, owner: true, location: true } })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
    async findOneByIdWithRelations(id: number, relations: {}) {
        const station = await this.stationRepository.findOne({
            where: { id },
            relations
        })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }

    async checkExistsFuelType(stationId: number, fuel_type: number) {
        const fuels = await this.fuelTypeService.getById(fuel_type)
        const station = await this.stationRepository.findOne({
            relations: { fuels: true },
            where: {
                id: stationId,
                fuels: {
                    id: fuel_type
                }
            },
        })
        if (!station)
            throw new BadRequestException("you don't have this fuel in this station")
    }
    async checkUpdateLimit(stationId: number) {
        const limit = await this.limitRepository.findOneBy({ stationId })
        if (limit) {
            const updated_at = new Date(moment(new Date(limit.updated_at)).format('YYYY-MM-DD'))
            const now = new Date(moment(new Date()).format('YYYY-MM-DD'))
            if (updated_at < now) {
                return await this.AddLimit({ stationId, value: 13500, by_user: false })
            }
        }
    }
    async AddLimit(limitDto: LimitDto) {
        let { date, stationId, value, by_user } = limitDto
        const station = await this.findOneById(stationId)
        let limit = await this.getLimitByStationId(station.id)
        if (!date) {
            date = new Date()
        } else {
            date = new Date(date)
        }
        if (limit) {
            limit.date = date
            limit.value = value
            limit.by_user = by_user
        } else {
            limit = this.limitRepository.create({ date, stationId, value, by_user })
        }
        await this.limitRepository.save(limit)
        return limit
    }
    //utils
    async getLimitByStationId(stationId: number) {
        const limit = await this.limitRepository.findOneBy({ stationId })
        if (!limit) return null
        return limit
    }
}
