import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumberString } from 'class-validator';
import { Request } from 'express';
import { StringToBoolean } from '../../../common/utils/boolean.utils';
import { StringToArray } from '../../../common/utils/stringToArray.utils';
import { RemoveNullProperty } from '../../../common/utils/update.utils';
import { FuelTypeService } from '../../../modules/fuel-type/fuel-type.service';
import { In, Repository } from 'typeorm';
import { LocationService } from '../../location/location.service';
import { UserService } from '../../user/user.service';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { StationEntity } from '../entity/station.entity';
import { StationMessages } from '../enum/message.enum';
import { requestOrder } from '../../../common/utils/order-by.utils';
import { getIdList } from '../../../common/utils/id.utils';

@Injectable({ scope: Scope.REQUEST })
export class StationService {
    constructor(
        @InjectRepository(StationEntity) private stationRepository: Repository<StationEntity>,
        private userService: UserService,
        private locationService: LocationService,
        private fuelTypeService: FuelTypeService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createStationDto: CreateStationDto) {
        try {
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
            await this.stationRepository.save(station)
            return {
                status: HttpStatus.OK,
                message: StationMessages.Created
            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const stations = await this.stationRepository.find({ relations: { location: true } });
            return {
                status: HttpStatus.OK,
                data: stations
            }
        } catch (error) {
            throw error
        }
    }

    async findOne(id: number) {
        try {
            const station = await this.stationRepository.findOne({
                where: { id },
                relations: {
                    location: true,
                    average_sale: true
                }
            })
            if (!station) throw new NotFoundException(StationMessages.NotFound)
            return {
                status: HttpStatus.OK,
                data: station
            }
        } catch (error) {
            throw error
        }
    }

    async update(id: number, updateStationDto: UpdateStationDto) {
        try {
            const { isActive, locationId, name, ownerId, fuel_types } = updateStationDto
            let fuels
            if (fuel_types) {
                const fuelIdList = getIdList(StringToArray(fuel_types))
                fuels = await this.fuelTypeService.getByIdList(fuelIdList)
            }
            const station = await this.findOneById(id)
            const updateObj = RemoveNullProperty({
                ...updateStationDto, isActive: StringToBoolean(isActive), fuels
            })
            //check user exist
            if (ownerId) await this.userService.findOneById(ownerId)
            //check location
            if (locationId) {
                await this.locationService.findOne(locationId)
                await this.checkExistsLocation(locationId)
            }
            await this.stationRepository.update(id, updateObj)
            return {
                status: HttpStatus.CREATED,
                message: StationMessages.Update
            }
        } catch (error) {
            throw error
        }
    }

    async remove(id: number) {
        try {
            const station = await this.findOneById(id)
            await this.stationRepository.remove(station)
            return {
                status: HttpStatus.OK,
                message: StationMessages.Remove

            }
        } catch (error) {
            throw error
        }
    }
    async stationStatusToggle(id: number) {
        try {
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
            throw error
        }
    }
    async myStation() {
        try {
            const { id, parentId } = this.req.user
            const station = await this.stationRepository.find({
                where: { ownerId: parentId ?? id },
                relations: {
                    requests: {
                        cargo: true
                    },
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
    async findByUserStation(userId: number, id: number) {
        const station = await this.stationRepository.findOne({ where: { ownerId: userId, id }, relations: { fuels: true } })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
    async findByUserId(userId: number) {
        const station = await this.stationRepository.findOne({ where: { ownerId: userId }, relations: { fuels: true } })
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
            where: { id: stationId, fuels }
        })
        if (!station)
            throw new BadRequestException("you don't have this fuel in this station")
    }
}
