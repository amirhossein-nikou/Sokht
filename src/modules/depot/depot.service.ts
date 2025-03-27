import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDepotDto, UpdateDepotDto } from './dto/depot.dto';
import { UserService } from '../user/user.service';
import { LocationService } from '../location/location.service';
import { DepotMessages } from './enum/message.enum';
import { DepotEntity } from './entity/depot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DepotService {
	constructor(
		@InjectRepository(DepotEntity) private depotRepository: Repository<DepotEntity>,
		private userService: UserService,
		private locationService: LocationService
	) { }
	async create(createDepotDto: CreateDepotDto) {
		const { locationId, name, ownerId } = createDepotDto
		await this.userService.findOneById(ownerId)
		await this.locationService.getOneById(locationId)
		await this.checkExistsLocation(locationId)
		
	}

	async findAll() {
		return `This action returns all depot`;
	}

	async findOne(id: number) {
		return `This action returns a #${id} depot`;
	}

	async update(id: number, updateDepotDto: UpdateDepotDto) {
		return `This action updates a #${id} depot`;
	}

	async remove(id: number) {
		return `This action removes a #${id} depot`;
	}
	// utils
	async checkExistsLocation(locationId: number) {
		const station = await this.depotRepository.findOne({ where: { locationId } })
		if (station) throw new ConflictException(DepotMessages.ExistsLocation)
		return false
	}
}
