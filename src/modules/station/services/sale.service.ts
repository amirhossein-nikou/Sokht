import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Repository } from 'typeorm';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { AverageSaleEntity } from '../entity/sale.entity';
import { SaleMessages } from '../enum/message.enum';
import { StationService } from './station.service';
import { UserRole } from 'src/modules/user/enum/role.enum';


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
			const { id } = this.req.user
			//await this.checkExists(stationId)
			await this.stationService.findOneById(stationId)
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
			const { id } = this.req.user
			const averageSales = await this.averageSaleRepository.find({
				relations: { station: true },
				where: {
					station: {
						ownerId: id
					}
				}
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
			const { id: userId } = this.req.user
			const averageSale = await this.averageSaleRepository.findOne({
				where: { id, station: { ownerId: userId } },
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

	async update(id: number, updateSaleDto: UpdateSaleDto) {
		try {
			const { id: userId } = this.req.user;
			if (updateSaleDto.stationId) await this.checkExists(updateSaleDto.stationId)
			const updateObj = RemoveNullProperty(updateSaleDto)
			await this.getOne(id)
			await this.averageSaleRepository.update({ id, station: { ownerId: userId } }, updateObj)
			return {
				statusCode: HttpStatus.CREATED,
				message: SaleMessages.Update
			}
		} catch (error) {
			throw error
		}
	}

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
	async getOneById(id: number, userId: number) {
		const averageSale = await this.averageSaleRepository.findOne({
			where: { id, station: { ownerId: userId } },
		});
		if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
		return averageSale
	}
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
}
