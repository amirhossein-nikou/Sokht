import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RemoveNullProperty } from '../../../common/utils/update.utils';
import { Repository } from 'typeorm';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { AverageSaleEntity } from '../entity/sale.entity';
import { SaleMessages } from '../enum/message.enum';
import { StationService } from './station.service';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable({ scope: Scope.REQUEST })
export class SaleService {
	constructor(
		@InjectRepository(AverageSaleEntity) private averageSaleRepository: Repository<AverageSaleEntity>,
		private stationService: StationService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createSaleDto: CreateSaleDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { fuel_type, average_sale, stationId } = createSaleDto
			const station = await this.stationService.findOneById(stationId)
			if (!station.fuels.find(item => item.id == fuel_type))
				throw new BadRequestException("you don't have this fuel in this station")
			let sale = await this.averageSaleRepository.findOne({
				where: {
					stationId, fuel_type
				}
			})
			if (!sale) {
				sale = this.averageSaleRepository.create({
					fuel_type, average_sale, stationId
				})
			} else {
				sale.average_sale = average_sale
			}
			const result = await this.averageSaleRepository.save(sale)
			return {
				statusCode: HttpStatus.CREATED,
				message: SaleMessages.Created,
				data: result
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	async findAll(paginationDto: PaginationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { limit, page, skip } = paginationSolver(paginationDto)
			const [averageSales, count] = await this.averageSaleRepository.findAndCount({
				relations: { station: true },
				select: {
					station: {name: true,id: true}
				},
				take: limit,
				skip
			});
			return {
				statusCode: HttpStatus.CREATED,
				pagination: paginationGenerator(limit, page, count),
				data: averageSales
			}
		} catch (error) {
			throw error
		}
	}

	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const averageSale = await this.averageSaleRepository.findOne({
				where: { id },
				relations: {
					station: true
				},
				select: {
					station: {name: true,id: true}
				}
			});
			if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
			return {
				statusCode: HttpStatus.CREATED,
				data: averageSale
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	// async update(id: number, updateSaleDto: UpdateSaleDto) {
	// 	try {
	// 		if (updateSaleDto.stationId) await this.checkExists(updateSaleDto.stationId)
	// 		const updateObj = RemoveNullProperty(updateSaleDto)
	// 		await this.getOne(id)
	// 		await this.averageSaleRepository.update({ id }, updateObj)
	// 		return {
	// 			statusCode: HttpStatus.CREATED,
	// 			message: SaleMessages.Update
	// 		}
	// 	} catch (error) {
	// 		throw error
	// 	}
	// }

	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const averageSale = await this.getOne(id)
			await this.averageSaleRepository.remove(averageSale)
			return {
				statusCode: HttpStatus.OK,
				message: SaleMessages.Remove
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	//utils
	async getOne(id: number) {
		const averageSale = await this.averageSaleRepository.findOne({
			where: { id },
		});
		if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
		return averageSale
	}
	async checkExists(stationId: number) {
		const averageSale = await this.averageSaleRepository.findOne({
			where: { stationId },
		});
		if (averageSale) throw new ConflictException(SaleMessages.AlreadyExists)
		return false
	}
	async findByStationIdAndFuel(stationId: number, fuelType: number) {
		const sale = await this.averageSaleRepository.findOne({
			where: {
				stationId,
				fuel_type: fuelType
			}
		});
		if (!sale) throw new NotFoundException(SaleMessages.NotFound)
		return sale
	}
}
