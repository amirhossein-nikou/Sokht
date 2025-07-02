import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { ILike, Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationEntity } from './entity/location.entity';
import { LocationMessages } from './enums/message.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class LocationService {
	constructor(
		@InjectRepository(LocationEntity) private locationRepository: Repository<LocationEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createLocationDto: CreateLocationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { lat, lon, address, province, city } = createLocationDto;
			const location = this.locationRepository.create({ lat, lon, address, province, city })
			const result = await this.locationRepository.save(location)
			return {
				statusCode: HttpStatus.CREATED,
				message: LocationMessages.Create,
				data: result
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async findAll(search: string, paginationDto: PaginationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { limit, page, skip } = paginationSolver(paginationDto)
			let where = ''
			if (search) {

			}
			const [locations, count] = await this.locationRepository.findAndCount({
				where:[	
					{city: ILike(search)},
					{province: ILike(search)},
				],
				take: limit,
				skip
			})
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: locations
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const location = await this.locationRepository.findOneBy({ id })
			if (!location) throw new NotFoundException(LocationMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: location,
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async update(id: number, updateLocationDto: UpdateLocationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const updateObj = RemoveNullProperty(updateLocationDto);
			await this.getOneById(id)
			await this.locationRepository.update(id, updateObj)
			const result = await this.getOneById(id)
			return {
				status: HttpStatus.CREATED,
				message: LocationMessages.Update,
				data: result
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const location = await this.getOneById(id)
			await this.locationRepository.remove(location)
			return {
				status: HttpStatus.OK,
				message: LocationMessages.Remove
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
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
