import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ModifyMobileNumber } from 'src/common/utils/mobile.utils';
import { Repository } from 'typeorm';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserMessages } from './enum/user.message';
import { isIdentityCard, isMobilePhone } from 'class-validator';


@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createUserDto: CreateUserDto) {
		try {
			const { first_name, last_name, mobile, national_code, certificateId, role } = createUserDto
			await this.checkExistsMobile(mobile)
			await this.checkExistsNationalCode(national_code)
			if (certificateId) await this.checkExistsCertificateId(certificateId)
			const user = this.userRepository.create({
				first_name, last_name,
				mobile: ModifyMobileNumber(mobile)
				, national_code, certificateId, role
			})
			await this.userRepository.save(user)
			return {
				statusCode: HttpStatus.CREATED,
				message: UserMessages.Created
			}
		} catch (error) {
			throw error
		}
	}

	async addSubUsers(addSubUserDto: AddSubUserDto) {
		try {
			const { first_name, last_name, mobile, national_code, certificateId } = addSubUserDto
			const { id } = this.req.user
			const user = await this.findOneById(id)
			if (user.parent) throw new BadRequestException('this user is not allowed to add sub users')
			await this.checkExistsMobile(mobile)
			await this.checkExistsNationalCode(national_code)
			if (certificateId) await this.checkExistsCertificateId(certificateId)
			const subUser = this.userRepository.create({
				first_name, last_name, mobile: ModifyMobileNumber(mobile), national_code, certificateId,
				parentId: user.id,
				role: user.role
			})
			await this.userRepository.save(subUser)
			return {
				statusCode: HttpStatus.CREATED,
				message: UserMessages.Created
			}
		} catch (error) {
			throw error
		}
	}
	async findAll() {
		try {
			const users = await this.userRepository.find();
			return {
				statusCode: HttpStatus.OK,
				data: users
			}
		} catch (error) {
			throw error
		}
	}
	async findOne(id: number) {
		try {
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
		} catch (error) {
			throw error
		}
	}
	async searchUser(search: string) {
		try {
			let where = {}
			if (isMobilePhone(search, 'fa-IR')) {
				where = {
					mobile: search
				}
			} else if (isIdentityCard(search, 'IR')) {
				where = {
					national_code: search
				}
			}
			const user = await this.userRepository.findOne({
				where,
				relations: {
					parent: true, child: true
				}
			})
			if (!user) throw new NotFoundException(UserMessages.NotFound)
			return {
				statusCode: HttpStatus.OK,
				data: user
			}
		} catch (error) {
			throw error
		}
	}
	// update(id: number, updateUserDto: UpdateUserDto) {
	// 	return `This action updates a #${id} user`;
	// }
	async remove(id: number) {
		try {
			const user = await this.findOneById(id)
			await this.userRepository.remove(user)
			return {
				statusCode: 200,
				message: UserMessages.Delete
			}
		} catch (error) {
			throw error
		}
	}
	async removeSubUser(id: number) {
		try {
			const parentId = this.req.user.id
			const user = await this.findOneById(id)
			if (user.id !== parentId) throw new BadRequestException('you just can remove your sub users')
			await this.userRepository.remove(user)
			return {
				statusCode: 200,
				message: UserMessages.Delete
			}
		} catch (error) {
			throw error
		}
	}
	async profile() {
		try {
			const id = this.req.user.id
			const user = await this.userRepository.findOne({
				where: { id },
				relations: {
					parent: true, child: true, otp: true, stations: true
				}
			})
			if (!user) throw new NotFoundException(UserMessages.NotFound)
			return user
		} catch (error) {
			throw error
		}
	}

	// utils 
	async findOneById(id: number) {
		const user = await this.userRepository.findOne({ where: { id } })
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}
	async checkExistsMobile(mobile: string) {
		const user = await this.userRepository.findOne({ where: { mobile: ModifyMobileNumber(mobile) } })
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
	async checkIfParent(id: number) {
		const user = await this.findOneById(id)
		if (user.parent !== null) {
			throw new UnauthorizedException(UserMessages.ParentAccess)
		}
		return user
	}

}
