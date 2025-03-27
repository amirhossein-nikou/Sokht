import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Repository } from 'typeorm';
import { LocationService } from '../../location/location.service';
import { UserService } from '../../user/user.service';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { StationEntity } from '../entity/station.entity';
import { StationMessages } from '../enum/message.enum';

@Injectable()
export class StationService {
    constructor(
        @InjectRepository(StationEntity) private stationRepository: Repository<StationEntity>,
        private userService: UserService,
        private locationService: LocationService,
    ) { }
    async create(createStationDto: CreateStationDto) {
        const { isActive, locationId, name, ownerId } = createStationDto
        //check user exist
        await this.userService.findOneById(ownerId)
        //check location
        await this.locationService.findOne(locationId)
        await this.checkExistsLocation(locationId)
        const station = this.stationRepository.create({ isActive, locationId, name, ownerId })
        await this.stationRepository.save(station)
        return {
            status: HttpStatus.OK,
            data: { message: StationMessages.Created }
        }
    }

    async findAll() {
        const stations = await this.stationRepository.find();
        return {
            status: HttpStatus.OK,
            data: stations
        }
    }

    async findOne(id: number) {
        const station = await this.stationRepository.findOne({
            where: { id },
            relations: {
                location: true,
                average_sales: true
            }
        })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return {
            status: HttpStatus.OK,
            data: station
        }
    }

    async update(id: number, updateStationDto: UpdateStationDto) {
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
        await this.stationRepository.update(id,updateObj)
        return {
            status: HttpStatus.CREATED,
            data: {
                message: StationMessages.Update
            }
        }
    }

    async remove(id: number) {
        const station = await this.findOneById(id)
        await this.stationRepository.remove(station)
        return {
            status: HttpStatus.OK,
            data: {
                message: StationMessages.Remove
            }
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
    async findByUserId(userId: number) {
        const station = await this.stationRepository.find({ where: { ownerId: userId } })
        if (!station || station.length == 0) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
}
