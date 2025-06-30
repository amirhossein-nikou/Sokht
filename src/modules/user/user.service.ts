import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { isIdentityCard, isMobilePhone } from 'class-validator';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ModifyMobileNumber } from 'src/common/utils/mobile.utils';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateMobileDto } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';
import { UserRole } from './enum/role.enum';
import { UserMessages } from './enum/user.message';


@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		private authService: AuthService,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createUserDto: CreateUserDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { role: userRole } = this.req.user
			const { first_name, last_name, mobile, national_code, certificateId, role } = createUserDto
			if (userRole === UserRole.HeadUser) {
				if (role === UserRole.Driver || role === UserRole.HeadUser)
					throw new ForbiddenException('you are not allow to create this roles')
			}
			await this.checkExistsMobile(mobile)
			await this.checkExistsNationalCode(national_code)
			if (certificateId) await this.checkExistsCertificateId(certificateId)
			const user = this.userRepository.create({
				first_name, last_name,
				mobile: ModifyMobileNumber(mobile),
				national_code, certificateId, role
			})
			const result = await this.userRepository.save(user)
			return {
				statusCode: HttpStatus.CREATED,
				data: result,
				message: UserMessages.Created
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	async addSubUsers(addSubUserDto: AddSubUserDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { first_name, last_name, mobile, national_code, certificateId } = addSubUserDto
			const { id } = this.req.user
			const user = await this.findOneById(id)
			if (user.parent || user.parentId) throw new BadRequestException('this user is not allowed to add sub users')
			if (user.child.length >= 3) throw new BadRequestException('you cant have more than 3 sub user')
			await this.checkExistsMobile(mobile)
			await this.checkExistsNationalCode(national_code)
			if (certificateId) await this.checkExistsCertificateId(certificateId)
			const subUser = this.userRepository.create({
				first_name, last_name, mobile: ModifyMobileNumber(mobile), national_code, certificateId,
				parentId: user.id,
				role: user.role
			})
			const result = await this.userRepository.save(subUser)
			return {
				statusCode: HttpStatus.CREATED,
				data: result,
				message: UserMessages.Created
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async addDriver(addSubUserDto: AddSubUserDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { first_name, last_name, mobile, national_code, certificateId } = addSubUserDto
			const { id } = this.req.user
			const user = await this.findOneById(id)
			if (user.parent || user.parentId) throw new BadRequestException('this user is not allowed to add driver')
			await this.checkExistsMobile(mobile)
			await this.checkExistsNationalCode(national_code)
			if (certificateId) await this.checkExistsCertificateId(certificateId)
			const driver = this.userRepository.create({
				first_name, last_name,
				mobile: ModifyMobileNumber(mobile), national_code, certificateId,
				//parentId: user.id,
				role: UserRole.Driver
			})
			await this.userRepository.save(driver)
			return {
				statusCode: HttpStatus.CREATED,
				data: {
					id: driver.id,
					first_name: driver.first_name,
					last_name: driver.last_name,
					mobile: driver.mobile,
					national_code: driver.national_code,
					certificateId: driver.certificateId
				},
				message: UserMessages.Created
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async findAllDrivers(paginationDto: PaginationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { limit, page, skip } = paginationSolver(paginationDto)
			const [drivers, count] = await this.userRepository.findAndCount({
				where: { role: UserRole.Driver },
				take: limit,
				skip
			});
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: drivers
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
			const [users, count] = await this.userRepository.findAndCount({
				take: limit,
				skip
			});
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: users
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const user = await this.userRepository.findOne({
				where: { id },
				relations: {
					parent: true, child: true, otp: true, stations: true
				},
			})
			if (!user) throw new NotFoundException(UserMessages.NotFound)
			return {
				statusCode: HttpStatus.OK,
				data: user
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async findOneDriver(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const user = await this.userRepository.findOne({
				where: { id },
				relations: {
					parent: true, child: true, otp: true, stations: true
				},
			})
			if (!user) throw new NotFoundException(UserMessages.NotFound)
			if (user.role !== UserRole.Driver) throw new NotFoundException('driver not found')
			return {
				statusCode: HttpStatus.OK,
				data: user
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async searchUser(search: string) {
		try {
			console.log(`access  -> ${this.req.url}`);
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
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async updateSubUserMobile(id: number, updateMobileDto: UpdateMobileDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: parentId } = this.req.user
			const { mobile } = updateMobileDto
			await this.checkExistsMobile(mobile)
			const user = await this.findOneById(id)
			if (user.parentId && user.parentId != parentId || !user.parentId) {
				throw new BadRequestException('this user is not your sub user')
			}
			await this.userRepository.update(id, { mobile: ModifyMobileNumber(mobile), verify_mobile: false })
			const result = await this.findOneById(id)
			return {
				statusCode: HttpStatus.OK,
				data: result,
				message: UserMessages.UpdateMobile
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async updateMyPhone(updateMobileDto: UpdateMobileDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id, mobile } = this.req.user
			const { mobile: newMobile } = updateMobileDto
			const user = await this.findOneById(id)
			if (mobile == newMobile) return {
				statusCode: HttpStatus.OK,
				message: 'mobile updated.'
			}
			await this.checkExistsMobile(newMobile)
			const code = await this.authService.createOtpForUser(user)
			await this.userRepository.update(id, {
				newMobile: ModifyMobileNumber(newMobile), verify_mobile: false
			})
			return {
				statusCode: HttpStatus.OK,
				message: 'check otp for verify and update new mobile',
				code
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async verifyUpdateMobile(code: string) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id, mobile } = this.req.user
			const user = await this.findOneById(id)
			if (!user.newMobile) throw new BadRequestException('please update phone first')
			await this.authService.checkOtp({ mobile, code })
			await this.userRepository.update(id, { mobile: user.newMobile, newMobile: null })
			const result = await this.findOneById(id)
			return {
				statusCode: HttpStatus.OK,
				data: result,
				message: 'mobile changed'
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const user = await this.findOneById(id)
			await this.userRepository.remove(user)
			return {
				statusCode: 200,
				message: UserMessages.Delete
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async removeDriver(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const user = await this.findOneById(id)
			if (user.role !== UserRole.Driver) {
				throw new ForbiddenException('you just can remove drivers')
			}
			await this.userRepository.remove(user)
			return {
				statusCode: 200,
				message: UserMessages.Delete
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async removeSubUser(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const parentId = this.req.user.id
			const user = await this.findOneById(id)
			if (user.parentId !== parentId) throw new BadRequestException('you just can remove your sub users')
			await this.userRepository.remove(user)
			return {
				statusCode: 200,
				message: UserMessages.Delete
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async profile() {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id, parentId } = this.req.user
			let relations: object = {
				child: true, stations: { location: true, fuels: true },
			}
			if (parentId) {
				relations = {
					parent: { stations: { location: true, fuels: true }, }
				}
			}
			const user = await this.userRepository.findOne({
				relations,
				where: { id },
				select: {
					parent: {
						first_name: true, last_name: true, mobile: true,
						national_code: true, certificateId: true
					},
					child: {
						id: true, first_name: true, last_name: true,
						mobile: true,// national_code: true, certificateId: true
					},
					stations: {
						name: true,
						isActive: true,

					}

				}

			})
			if (!user) throw new NotFoundException(UserMessages.NotFound)
			return {
				statusCode: HttpStatus.OK,
				data: user
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	async mySubUsers() {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id } = this.req.user
			const subUsers = await this.userRepository.find({
				where: { parentId: id },
				select: {
					id: true, first_name: true, last_name: true,
					mobile: true, national_code: true, certificateId: true
				}
			})
			if (subUsers.length == 0) throw new NotFoundException('we cant find any sub users for you')
			return {
				statusCode: HttpStatus.OK,
				data: subUsers
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	// utils 
	async findOneById(id: number) {
		const user = await this.userRepository.findOne({ where: { id }, relations: { child: true } })
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}
	async findStationId(id: number) {
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
		if (user) throw new ConflictException('CertificateId unavailable')
		return false
	}
	async checkIfParent(id: number) {
		const user = await this.findOneById(id)
		if (user.parent || user.parentId) {
			throw new UnauthorizedException(UserMessages.ParentAccess)
		}
		return user
	}

}
