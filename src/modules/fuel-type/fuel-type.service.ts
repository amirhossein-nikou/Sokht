import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFuelTypeDto } from './dto/create-fuel-type.dto';
import { UpdateFuelTypeDto } from './dto/update-fuel-type.dto';
import { FuelTypeEntity } from './entities/fuel-type.entity';

@Injectable()
export class FuelTypeService {
	constructor(
		@InjectRepository(FuelTypeEntity) private fuelTypeRepository: Repository<FuelTypeEntity>
	) { }
	async create(createFuelTypeDto: CreateFuelTypeDto) {
		try {
			const { name } = createFuelTypeDto
			const type = this.fuelTypeRepository.create({ name })
			const result = await this.fuelTypeRepository.save(type)
			return {
				statusCode: HttpStatus.CREATED,
				message: 'new fuel created',
				data: result
			}
		} catch (error) {
			throw error
		}
	}

	async findAll() {
		try {
			const fuelTypes = await this.fuelTypeRepository.find()
			return {
				statusCode: HttpStatus.OK,
				data: fuelTypes
			}
		} catch (error) {
			throw error
		}
	}

	async findOne(id: number) {
		try {
			const fuelType = await this.fuelTypeRepository.findOne({ where: { id } })
			if (!fuelType) throw new NotFoundException('fuel not found')
			return {
				statusCode: HttpStatus.OK,
				data: fuelType
			}
		} catch (error) {
			throw error
		}
	}

	async remove(id: number) {
		try {
			const type = await this.getById(id)
			await this.fuelTypeRepository.remove(type)
		} catch (error) {
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
		const fuelType = await this.fuelTypeRepository.find({ where: { id:In(ids) } })
		if (fuelType.length < ids.length) throw new NotFoundException('fuel not found')
		return fuelType
	}
}
