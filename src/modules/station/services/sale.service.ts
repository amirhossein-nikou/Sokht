import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { UserService } from 'src/modules/user/user.service';
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
		private userService: UserService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createSaleDto: CreateSaleDto) {
		const { fuel_type, monthly_average_sale, stationId } = createSaleDto
		const { id } = this.req.user
		await this.stationService.findByUserStation(id, stationId);
		const sale = this.averageSaleRepository.create({ fuel_type, monthly_average_sale, stationId })
		await this.averageSaleRepository.save(sale)
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: SaleMessages.Created }
		}
	}

	async findAll() {
		const { id } = this.req.user
		const stations = await this.stationService.findByUserId(id)
		// const idList: number[] = stations.map(station => {
		// 	if (station.ownerId == id) {
		// 		return station.id
		// 	}
		// })
		const averageSales = await this.averageSaleRepository.find({
			relations: { station: true }
		});
		return {
			statusCode: HttpStatus.CREATED,
			data: averageSales
		}
	}

	async findOne(id: number) {
		const { id: userId } = this.req.user
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
	}

	async update(id: number, updateSaleDto: UpdateSaleDto) {
		const { id: userId } = this.req.user;
		const stationId = await this.userService.findUserStationId(userId)
		const averageSale = await this.getOneById(id, stationId)
		const updateObj = RemoveNullProperty(updateSaleDto)
		await this.averageSaleRepository.update(id,updateObj)
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: SaleMessages.Update }
		}
	}

	async remove(id: number) {
		const { id: userId } = this.req.user;
		const stationId = await this.userService.findUserStationId(userId)
		const averageSale = await this.getOneById(id, stationId)
		await this.averageSaleRepository.remove(averageSale)
		return {
			statusCode: HttpStatus.OK,
			data: { message: SaleMessages.Remove }
		}
	}
	//utils
	async getOneById(id: number, stationId: number) {
		const averageSale = await this.averageSaleRepository.findOne({
			where: { id, stationId: stationId || null },
		});
		if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
		return averageSale
	}
}
