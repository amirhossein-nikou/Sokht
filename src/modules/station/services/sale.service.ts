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


@Injectable({ scope: Scope.REQUEST })
export class SaleService {
	constructor(
		@InjectRepository(AverageSaleEntity) private averageSaleRepository: Repository<AverageSaleEntity>,
		private stationService: StationService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createSaleDto: CreateSaleDto) {
		try {
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
			await this.averageSaleRepository.save(sale)
			return {
				statusCode: HttpStatus.CREATED,
				message: SaleMessages.Created
			}
		} catch (error) {
			throw error
		}
	}

	async findAll() {
		try {
			const averageSales = await this.averageSaleRepository.find({
				relations: { station: true },
			});
			return {
				statusCode: HttpStatus.CREATED,
				data: averageSales
			}
		} catch (error) {
			throw error
		}
	}

	async findOne(id: number) {
		try {
			const averageSale = await this.averageSaleRepository.findOne({
				where: { id },
				relations: {
					station: true
				}
			});
			if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
			return {
				statusCode: HttpStatus.CREATED,
				data: averageSale
			}
		} catch (error) {
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
			const averageSale = await this.getOne(id)
			await this.averageSaleRepository.remove(averageSale)
			return {
				statusCode: HttpStatus.OK,
				message: SaleMessages.Remove
			}
		} catch (error) {
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
