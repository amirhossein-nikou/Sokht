import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFuelTypeDto } from './dto/create-fuel-type.dto';
import { UpdateFuelTypeDto } from './dto/update-fuel-type.dto';
import { FuelTypeEntity } from './entities/fuel-type.entity';
import { REQUEST } from '@nestjs/core';
import e, { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class FuelTypeService {
	constructor(
		@InjectRepository(FuelTypeEntity) private fuelTypeRepository: Repository<FuelTypeEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createFuelTypeDto: CreateFuelTypeDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { name } = createFuelTypeDto
			const type = this.fuelTypeRepository.create({ name })
			const result = await this.fuelTypeRepository.save(type)
			return {
				statusCode: HttpStatus.CREATED,
				message: 'new fuel created',
				data: result
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `  , error.message)
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
			console.log(`error -> ${this.req.url} -> `  , error.message)
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
			console.log(`error -> ${this.req.url} -> `  , error.message)
			throw error
		}
	}

	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const type = await this.getById(id)
			await this.fuelTypeRepository.remove(type)
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `  , error.message)
			throw error
		}
	}
	// utils 
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
