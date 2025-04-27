import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Repository } from 'typeorm';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { CreateDepotDto, UpdateDepotDto } from './dto/depot.dto';
import { DepotEntity } from './entity/depot.entity';
import { DepotMessages } from './enum/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class DepotService {
	constructor(
		@InjectRepository(DepotEntity) private depotRepository: Repository<DepotEntity>,
		private userService: UserService,
		private locationService: LocationService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createDepotDto: CreateDepotDto) {
		try {
			//const user = await this.userService.findOneById(this.req.user.id)
			//check user role to be head-boss then allow create new depot
			const { locationId, name, ownerId } = createDepotDto
			await this.userService.findOneById(ownerId)
			await this.locationService.getOneById(locationId)
			await this.checkExistsLocation(locationId)
			const depot = this.depotRepository.create({ locationId, name, ownerId })
			await this.depotRepository.save(depot)
			return {
				statusCode: HttpStatus.CREATED,

				message: DepotMessages.Create

			}
		} catch (error) {
			throw error
		}
	}
	//may need auth
	async findAll() {
		try {
			const { id } = this.req.user
			const depots = await this.depotRepository.find({
				where: { ownerId: id },
				relations: { location: true }
			})
			return {
				statusCode: HttpStatus.OK,
				data: depots
			}
		} catch (error) {
			throw error
		}
	}

	async findOne(id: number) {
		try {
			const { id: ownerId } = this.req.user
			const depot = await this.depotRepository.findOne({ where: { ownerId, id }, relations: { location: true } })
			if (!depot) throw new NotFoundException(DepotMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: depot
			}
		} catch (error) {
			throw error
		}
	}

	async update(id: number, updateDepotDto: UpdateDepotDto) {
		try {
			//check user role to be head-boss then allow update depot
			const { locationId, name, ownerId } = updateDepotDto
			const updateObject = RemoveNullProperty({ locationId, name, ownerId })
			const depot = await this.findOneById(id)
			if (ownerId && ownerId.toString() !== "0") await this.userService.findOneById(ownerId)
			if (locationId && locationId.toString() !== "0") {
				await this.locationService.getOneById(locationId)
				await this.checkExistsLocation(locationId)
			}
			await this.depotRepository.update(id, updateObject)
			return {
				statusCode: HttpStatus.OK,
				message: DepotMessages.Update

			}
		} catch (error) {
			throw error
		}
	}

	async remove(id: number) {
		try {
			const { id: ownerId } = this.req.user
			const depot = await this.findOneByIdWithOwner(id, ownerId)
			await this.depotRepository.remove(depot)
			return {
				statusCode: HttpStatus.OK,
				message: DepotMessages.Remove

			}
		} catch (error) {
			throw error
		}
	}
	// utils
	async checkExistsLocation(locationId: number) {
		const station = await this.depotRepository.findOne({ where: { locationId } })
		if (station) throw new ConflictException(DepotMessages.ExistsLocation)
		return false
	}
	async findOneByIdWithOwner(id: number, ownerId: number) {
		const depot = await this.depotRepository.findOne({ where: { ownerId, id } })
		if (!depot) throw new NotFoundException(DepotMessages.Notfound)
		return depot
	}
	async findOneById(id: number) {
		const depot = await this.depotRepository.findOne({ where: { id } })
		if (!depot) throw new NotFoundException(DepotMessages.Notfound)
		return depot
	}
}
