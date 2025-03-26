import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStationDto, UpdateStationDto } from '../dto/station.dto';
import { InjectModel } from '@nestjs/sequelize';
import { StationModel } from './../models/station.model';
import { UserService } from '../../user/user.service';
import { LocationService } from '../../location/location.service';
import { LocationModel } from '../../location/models/location.model';
import { AverageSaleModel } from '../models/sale.model';
import { StationMessages } from '../enum/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';

@Injectable()
export class StationService {
    constructor(
        @InjectModel(StationModel) private stationModel: typeof StationModel,
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
        await this.stationModel.create({ isActive, locationId, name, ownerId })
        return {
            status: HttpStatus.OK,
            data: { message: StationMessages.Created }
        }
    }

    async findAll() {
        const stations = await this.stationModel.findAll();
        return {
            status: HttpStatus.OK,
            data: stations
        }
    }

    async findOne(id: number) {
        const station = await this.stationModel.findOne({
            where: { id },
            include: [
                {
                    as: 'location',
                    model: LocationModel
                },
                {
                    as: "average_sales",
                    model: AverageSaleModel,
                    attributes: ['monthly_average_sale', 'fuel_type', 'createdAt']
                }
            ]
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
        await station.update(updateObj)
        return {
            status: HttpStatus.CREATED,
            data: {
                message: StationMessages.Update
            }
        }
    }

    async remove(id: number) {
        const station = await this.findOneById(id)
        await station.destroy()
        return {
            status: HttpStatus.OK,
            data: {
                message: StationMessages.Remove
            }
        }
    }
    // utils
    async checkExistsLocation(locationId: number) {
        const station = await this.stationModel.findOne({ where: { locationId } })
        if (station) throw new ConflictException(StationMessages.ExistsLocation)
        return false
    }
    async findOneById(id: number) {
        const station = await this.stationModel.findOne({
            where: { id },
            include: {
                as: 'location',
                model: LocationModel
            }
        })
        if (!station) throw new NotFoundException(StationMessages.NotFound)
        return station
    }
}
