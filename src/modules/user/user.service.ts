import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UserMessages } from './enum/user.message';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';


@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createUserDto: CreateUserDto) {
		const { first_name, last_name, mobile, national_code, certificateId, role } = createUserDto
		await this.checkExistsMobile(mobile)
		await this.checkExistsNationalCode(national_code)
		if (certificateId) await this.checkExistsCertificateId(certificateId)
		const user = this.userRepository.create({ first_name, last_name, mobile, national_code, certificateId, role })
		await this.userRepository.save(user)
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: UserMessages.Created }
		}
	}

	async addSubUsers(addSubUserDto: AddSubUserDto) {
		const { first_name, last_name, mobile, national_code, certificateId } = addSubUserDto
		const { id } = this.req.user
		const user = await this.findOneById(id)
		if (user.parent) throw new BadRequestException('this user is not allowed to add sub users')
		await this.checkExistsMobile(mobile)
		await this.checkExistsNationalCode(national_code)
		if (certificateId) await this.checkExistsCertificateId(certificateId)
		const subUser = this.userRepository.create({
			first_name, last_name, mobile, national_code, certificateId,
			parentId: user.id,
			role: user.role
		})
		await this.userRepository.save(subUser)
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: UserMessages.Created }
		}
	}
	async findAll() {
		const users = await this.userRepository.find();
		return {
			statusCode: HttpStatus.OK,
			data: users
		}
	}
	async findOne(id: number) {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: {
				parent: true, child: true, otp: true, stations: true
			}
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return {
			statusCode: HttpStatus.OK,
			data: user
		}
	}

	// update(id: number, updateUserDto: UpdateUserDto) {
	// 	return `This action updates a #${id} user`;
	// }
	async remove(id: number) {
		const user = await this.findOneById(id)
		await this.userRepository.remove(user)
		return {
			statusCode: 200,
			message: UserMessages.Delete
		}
	}
	async profile() {
		const id = this.req.user.id
		const user = await this.userRepository.findOne({
			where: { id },
			relations: {
				parent: true, child: true, otp: true, stations: true
			}
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}

	// utils 
	async findOneById(id: number) {
		const user = await this.userRepository.findOne({ where: { id } })
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}
	async checkExistsMobile(mobile: string) {
		const user = await this.userRepository.findOne({ where: { mobile } })
		if (user) throw new ConflictException('mobile unavailable')
		return false
	}
	async checkExistsNationalCode(national_code: string) {
		const user = await this.userRepository.findOne({ where: { national_code } })
		if (user) throw new ConflictException('national code unavailable')
		return false
	}
	async checkExistsCertificateId(certificateId: number) {
		const user = await this.userRepository.findOne({ where: { certificateId } })
		if (user) throw new ConflictException('national code unavailable')
		return false
	}
	async findUserStationId(id: number) {
		const user = await this.userRepository.findOne({
			where: { id },
			relations:{stations: true},
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		//if (user.station == null) throw new BadRequestException(UserMessages.NoStation)
		return user.stations.find(station => station.id == id).id
	}
}
