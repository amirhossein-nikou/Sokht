import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Repository } from 'typeorm';
import { LocationService } from '../../location/location.service';
import { UserService } from '../../user/user.service';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { StationEntity } from '../entity/station.entity';
import { StationMessages } from '../enum/message.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class StationService {
    constructor(
        @InjectRepository(StationEntity) private stationRepository: Repository<StationEntity>,
        private userService: UserService,
        private locationService: LocationService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createStationDto: CreateStationDto) {
        try {
            const { isActive, locationId, name, ownerId } = createStationDto
            //check user exist
            const user = await this.userService.findOneById(ownerId)
            if (user.parentId) throw new BadRequestException(StationMessages.ParentExists)
            //check location
            await this.locationService.findOne(locationId)
            await this.checkExistsLocation(locationId)
            const station = this.stationRepository.create({ isActive, locationId, name, ownerId })
            await this.stationRepository.save(station)
            return {
                status: HttpStatus.OK,
                data: { message: StationMessages.Created }
            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const stations = await this.stationRepository.find();
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
            const { isActive, locationId, name, ownerId } = updateStationDto
            const station = await this.findOneById(id)
            const updateObj = RemoveNullProperty(updateStationDto)
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
                data: {
                    message: StationMessages.Update
                }
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
                data: {
                    message: StationMessages.Remove
                }
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
                data: { message }
            }
        } catch (error) {
            throw error
        }
    }
    async myStation() {
        try {
            const { id, parentId } = this.req.user
            const station = await this.stationRepository.findOne({
                where: { ownerId: parentId ?? id },
                relations: {
                    requests: {
                        cargo: true
                    },
                    average_sale: true,
                    max_capacity: true,
                    location: true
                },
                order: {
                    requests: {
                        receive_at: 'ASC',
                        priority: 'ASC'
                    }
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
                location: true
            }
        })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
    async findByUserStation(userId: number, id: number) {
        const station = await this.stationRepository.findOne({ where: { ownerId: userId, id } })
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
}
