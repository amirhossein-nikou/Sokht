import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { UserMessages } from './enum/user.message';
import { OtpModel } from '../auth/model/otp.model';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StationModel } from '../station/models/station.model';
import { IncludeType } from 'src/common/types/include.type';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectModel(UserModel) private userModel: typeof UserModel,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createUserDto: CreateUserDto) {
		const { first_name, last_name, mobile, national_code, certificateId, role } = createUserDto
		await this.checkExistsMobile(mobile)
		await this.checkExistsNationalCode(national_code)
		if (certificateId) await this.checkExistsCertificateId(certificateId)
		await this.userModel.create({ first_name, last_name, mobile, national_code, certificateId, role })
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
		await this.userModel.create({
			first_name, last_name, mobile, national_code, certificateId,
			parentId: user.id,
			role: user.role
		})
		return {
			statusCode: HttpStatus.CREATED,
			data: { message: UserMessages.Created }
		}
	}
	async findAll() {
		const users =  await this.userModel.findAll();
		return {
			statusCode: HttpStatus.OK,
			data: users
		}
	}
	async findOne(id: number) {
		const user = await this.userModel.findOne({
			where: { id },
			include: [
				{
					as: 'parent',
					model: UserModel,
					attributes: [
						"id",
						"first_name",
						"last_name",
						"mobile",
						"national_code",
					]
				},
				{
					as: 'child',
					model: UserModel,
					attributes: [
						"id",
						"first_name",
						"last_name",
						"mobile",
						"national_code",
					]
				},
				{
					as: 'otp',
					model: OtpModel,
					attributes: [
						'code',
						'expires_in',
					]
				},
				{
					as: 'station',
					model: StationModel,
				}
			]
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
		await user.destroy()
		return {
			statusCode: 200,
			message: UserMessages.Delete
		}
	}
	async profile() {
		const id = this.req.user.id
		const user = await this.userModel.findOne({
			where: { id },
			include: [
				{
					as: 'parent',
					model: UserModel,
					attributes: [
						"id",
						"first_name",
						"last_name",
						"mobile",
						"national_code",
					]
				},
				{
					as: 'child',
					model: UserModel,
					attributes: [
						"id",
						"first_name",
						"last_name",
						"mobile",
						"national_code",
					]
				},
				{
					as: 'otp',
					model: OtpModel,
					attributes: [
						'code',
						'expires_in',
					]
				},
			]
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}

	// utils 
	async findOneById(id: number) {
		const user = await this.userModel.findOne({ where: { id } })
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user
	}
	async checkExistsMobile(mobile: string) {
		const user = await this.userModel.findOne({ where: { mobile } })
		if (user) throw new ConflictException('mobile unavailable')
		return false
	}
	async checkExistsNationalCode(national_code: string) {
		const user = await this.userModel.findOne({ where: { national_code } })
		if (user) throw new ConflictException('national code unavailable')
		return false
	}
	async checkExistsCertificateId(certificateId: number) {
		const user = await this.userModel.findOne({ where: { certificateId } })
		if (user) throw new ConflictException('national code unavailable')
		return false
	}
	async findUser(id: number, include: IncludeType | Array<IncludeType>) {
		const user = await this.userModel.findOne({
			where: { id },
			include
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		return user

	}
	async findUserStationId(id: number){
		const user = await this.userModel.findOne({
			where: { id },
			include: {
				as: 'station',
				model:StationModel,
				attributes: ['id']
			},
			attributes: ['mobile','id','role']
		})
		if (!user) throw new NotFoundException(UserMessages.NotFound)
		//if (user.station == null) throw new BadRequestException(UserMessages.NoStation)
		return user.station.id
	}
}
