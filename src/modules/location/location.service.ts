import {  HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectModel } from '@nestjs/sequelize';
import { LocationModel } from './models/location.model';
import { LocationMessages } from './enums/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';

@Injectable()
export class LocationService {
	constructor(
		@InjectModel(LocationModel) private locationModel: typeof LocationModel
	) { }
	async create(createLocationDto: CreateLocationDto) {
		const { lat, lon } = createLocationDto;
		await this.locationModel.create({ lat, lon })
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: LocationMessages.Create }
		}
	}

	async findAll() {
		const locations = await this.locationModel.findAll()
		return {
			statusCode: HttpStatus.OK,
			data: locations
		}
	}

	async findOne(id: number) {
		const location = await this.locationModel.findByPk(id)
		if (!location) throw new NotFoundException(LocationMessages.Notfound)
		return {
			statusCode: HttpStatus.OK,
			data: location
		}
	}

	async update(id: number, updateLocationDto: UpdateLocationDto) {
		const updateObj = RemoveNullProperty(updateLocationDto);
		const location = await this.getOneById(id)
		await location.update(updateObj)
		return {
			status: HttpStatus.CREATED,
			data: { message: LocationMessages.Update }
		}
	}

	async remove(id: number) {
		const location = await this.getOneById(id)
		await location.destroy()
		return {
			status: HttpStatus.OK,
			data: { message: LocationMessages.Remove }
		}
	}

	async getOneById(id: number) {
		const location = await this.locationModel.findByPk(id)
		if (!location) throw new NotFoundException(LocationMessages.Notfound)
		return location
	}
}
