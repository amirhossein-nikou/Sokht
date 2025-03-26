import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { SaleMessages } from '../enum/message.enum';
import { AverageSaleModel } from '../models/sale.model';
import { StationService } from './station.service';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UserService } from 'src/modules/user/user.service';


@Injectable({scope:Scope.REQUEST})
export class SaleService {
	constructor(
		@InjectModel(AverageSaleModel) private averageSaleModel: typeof AverageSaleModel,
		private stationService: StationService,
		private userService: UserService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createSaleDto: CreateSaleDto) {
		const { fuel_type, monthly_average_sale } = createSaleDto
		const {id} = this.req.user
		const stationId = await this.userService.findUserStationId(id)
		await this.stationService.findOne(stationId)
		const averageSale = await this.averageSaleModel.create({ fuel_type, monthly_average_sale, stationId })
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: SaleMessages.Created }
		}
	}

	async findAll() {
		const {id} = this.req.user
		const stationId = await this.userService.findUserStationId(id)
		const averageSales = await this.averageSaleModel.findAll({
			where: {
				stationId: stationId || null
			}
		});
		return {
			statusCode: HttpStatus.CREATED,
			data: averageSales
		}
	}

	async findOne(id: number) {
		const {id: userId} = this.req.user
		const stationId = await this.userService.findUserStationId(userId)
		const averageSale = await this.averageSaleModel.findOne({
			where: { id, stationId: stationId || null },
		});
		if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
		return {
			statusCode: HttpStatus.CREATED,
			data: averageSale
		}
	}

	async update(id: number, updateSaleDto: UpdateSaleDto) {
		const {id: userId} = this.req.user;
		const stationId = await this.userService.findUserStationId(userId)
		const averageSale = await this.getOneById(id,stationId)
		const updateObj = RemoveNullProperty(updateSaleDto)
		await averageSale.update(updateObj)
		return {
			statusCode: HttpStatus.CREATED,
			data : {message: SaleMessages.Update}
		}
	}

	async remove(id: number) {
		const {id: userId} = this.req.user;
		const stationId = await this.userService.findUserStationId(userId)
		const averageSale = await this.getOneById(id,stationId)
		await averageSale.destroy()
		return {
			statusCode: HttpStatus.OK,
			data: {message: SaleMessages.Remove}
		}
	}
	//utils
	async getOneById(id: number,stationId: number) {
		const averageSale = await this.averageSaleModel.findOne({
			where: { id, stationId: stationId || null },
		});
		if (!averageSale) throw new NotFoundException(SaleMessages.NotFound)
		return averageSale
	}
}
