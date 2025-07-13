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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { UserRole } from '../user/enum/role.enum';
import { PremiumRoles } from 'src/common/enums/otherRole.enum';

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
			console.log(`access  -> ${this.req.url}`);
			const { locationId, name, ownerId } = createDepotDto
			await this.userService.findOneById(ownerId)
			await this.locationService.getOneById(locationId)
			await this.checkExistsLocation(locationId)
			const depot = this.depotRepository.create({ locationId, name, ownerId })
			const result = await this.depotRepository.save(depot)
			return {
				statusCode: HttpStatus.CREATED,
				message: DepotMessages.Create,
				data: result
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async findAll(paginationDto: PaginationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { limit, page, skip } = paginationSolver(paginationDto)
			const [depots, count] = await this.depotRepository.findAndCount({
				relations: { location: true, owner: true },
				take: limit,
				skip
			})
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: depots
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: ownerId } = this.req.user
			const depot = await this.depotRepository.findOne({ where: { id }, relations: { location: true, owner: true } })
			if (!depot) throw new NotFoundException(DepotMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: depot
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}
	async myDepot(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: ownerId, parentId } = this.req.user
			const depot = await this.depotRepository.findOne({
				where: {
					ownerId: parentId ?? ownerId,
					id
				}, relations: { location: true, owner: true, requests: true, tankers: true }
			})
			if (!depot) throw new NotFoundException(DepotMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: depot
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}
	async update(id: number, updateDepotDto: UpdateDepotDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { locationId, name, ownerId } = updateDepotDto
			const updateObject = RemoveNullProperty({ locationId, name, ownerId })
			const depot = await this.findOneById(id)
			if (ownerId && ownerId.toString() !== "0") await this.userService.findOneById(ownerId)
			if (locationId && locationId.toString() !== "0" && locationId != depot.locationId) {
				await this.locationService.getOneById(locationId)
				if (locationId !== depot.locationId) await this.checkExistsLocation(locationId)
			}
			await this.depotRepository.update(id, updateObject)
			const result = await this.findOneById(id)
			return {
				statusCode: HttpStatus.OK,
				message: DepotMessages.Update,
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
			const { id: ownerId, role } = this.req.user
			let depot
			if (role !== UserRole.OilDepotUser) {
				depot = await this.findOneById(id)
			} else {
				depot = await this.findOneByIdWithOwner(id, ownerId)
			}
			await this.depotRepository.remove(depot)
			return {
				statusCode: HttpStatus.OK,
				message: DepotMessages.Remove

			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
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
	async findOneByUserId(ownerId: number) {
		const depot = await this.depotRepository.findOne({ where: { ownerId } })
		if (!depot) throw new NotFoundException(DepotMessages.Notfound)
		return depot
	}
	async getNameList() {
		const depots = await this.depotRepository.find({
			select: {
				id: true,
				name: true,
			}
		})
		return depots
	}
	async getAllDepots() {
		const [depots, count] = await this.depotRepository.findAndCount()
		return depots
	}
}
