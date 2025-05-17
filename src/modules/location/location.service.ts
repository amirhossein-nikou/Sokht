import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationEntity } from './entity/location.entity';
import { LocationMessages } from './enums/message.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';

@Injectable()
export class LocationService {
	constructor(
		@InjectRepository(LocationEntity) private locationRepository: Repository<LocationEntity>
	) { }
	async create(createLocationDto: CreateLocationDto) {
		try {
			const { lat, lon, address } = createLocationDto;
			const location = this.locationRepository.create({ lat, lon, address })
			await this.locationRepository.save(location)
			return {
				statusCode: HttpStatus.CREATED,
				message: LocationMessages.Create
			}
		} catch (error) {
			throw error
		}
	}

	async findAll(paginationDto: PaginationDto) {
		try {
			const { limit, page, skip } = paginationSolver(paginationDto)
			const [locations, count] = await this.locationRepository.findAndCount({
				take: limit,
				skip
			})
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: locations
			}
		} catch (error) {
			throw error
		}
	}

	async findOne(id: number) {
		try {
			const location = await this.locationRepository.findOneBy({ id })
			if (!location) throw new NotFoundException(LocationMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: location
			}
		} catch (error) {
			throw error
		}
	}

	async update(id: number, updateLocationDto: UpdateLocationDto) {
		try {
			const updateObj = RemoveNullProperty(updateLocationDto);
			await this.getOneById(id)
			await this.locationRepository.update(id, updateObj)
			return {
				status: HttpStatus.CREATED,
				message: LocationMessages.Update
			}
		} catch (error) {
			throw error
		}
	}

	async remove(id: number) {
		try {
			const location = await this.getOneById(id)
			await this.locationRepository.remove(location)
			return {
				status: HttpStatus.OK,
				message: LocationMessages.Remove
			}
		} catch (error) {
			throw error
		}
	}
	// utils
	async getOneById(id: number) {
		const location = await this.locationRepository.findOneBy({ id })
		if (!location) throw new NotFoundException(LocationMessages.Notfound)
		return location
	}
}
