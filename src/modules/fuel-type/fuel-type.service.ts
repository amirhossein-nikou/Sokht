import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFuelTypeDto } from './dto/create-fuel-type.dto';
import { UpdateFuelTypeDto } from './dto/update-fuel-type.dto';
import { FuelTypeEntity } from './entities/fuel-type.entity';
import { REQUEST } from '@nestjs/core';
import e, { Request } from 'express';
import { FuelTypeEnum } from 'src/common/enums/fuelType.enum';
import * as  moment from 'jalali-moment';

@Injectable({ scope: Scope.REQUEST })
export class FuelTypeService {
	constructor(
		@InjectRepository(FuelTypeEntity) private fuelTypeRepository: Repository<FuelTypeEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createFuelTypeDto: CreateFuelTypeDto) {
		const { name, id, available_value } = createFuelTypeDto
		const type = await this.fuelTypeRepository.findOneBy({ id })
		if (type) return
		const result = this.fuelTypeRepository.create({ id, name, available_value })
		await this.fuelTypeRepository.save(result)
		return 'created'
	}
	async insertFuelType() {
		await this.create({ id: FuelTypeEnum.Diesel, name: "نفت گاز", available_value: [17500, 13500, 29500] })
		await this.create({ id: FuelTypeEnum.Petrol, name: 'بنزین', available_value: [32000, 14000, 18000] })
		await this.create({ id: FuelTypeEnum.Super, name: "بنزین سوپر", available_value: [3200] })
	}
	async addLimitForDiesel(limit: number) {
		try {
			const diesel = await this.fuelTypeRepository.findOneBy({ id: FuelTypeEnum.Diesel })
			//if (!diesel.available_value.includes(limit)) throw new BadRequestException(`chose a limit between following values => ${diesel.available_value}`)
			diesel.limit = limit
			await this.fuelTypeRepository.save(diesel)
			return {
				statusCode: HttpStatus.CREATED,
				message: 'limit add successfully',
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}
	async findAll() {
		try {
			console.log(`access  -> ${this.req.url}`);
			const fuelTypes = await this.fuelTypeRepository.find()
			return {
				statusCode: HttpStatus.OK,
				data: fuelTypes
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const fuelType = await this.fuelTypeRepository.findOne({ where: { id } })
			if (!fuelType) throw new NotFoundException('fuel not found')
			return {
				statusCode: HttpStatus.OK,
				data: fuelType
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}

	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const type = await this.getById(id)
			await this.fuelTypeRepository.remove(type)
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message)
			throw error
		}
	}
	// utils 
	async checkUpdateLimit() {
		const diesel = await this.fuelTypeRepository.findOneBy({ id: FuelTypeEnum.Diesel })
		const updated_at = new Date(moment(diesel.updated_at).format('YYYY-MM-DD'))
		const now = new Date(moment(new Date()).format('YYYY-MM-DD'))
		if (updated_at < now) {
			return await this.addLimitForDiesel(13500)
		}
	}
	async getById(id: number) {
		const fuelType = await this.fuelTypeRepository.findOne({ where: { id } })
		if (!fuelType) throw new NotFoundException('fuel not found')
		return fuelType
	}
	async getByIdList(ids: number[]) {
		const fuelType = await this.fuelTypeRepository.find({ where: { id: In(ids) } })
		if (fuelType.length < ids.length) throw new NotFoundException('fuel not found')
		return fuelType
	}
}
