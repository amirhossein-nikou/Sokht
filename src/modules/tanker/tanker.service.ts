import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { In, Repository } from 'typeorm';
import { DepotService } from '../depot/depot.service';
import { UserService } from '../user/user.service';
import { CreateTankerDto } from './dto/create-tanker.dto';
import { UpdateTankerDto } from './dto/update-tanker.dto';
import { TankerEntity } from './entities/tanker.entity';
import { TankerMessages } from './enum/message.enum';
import { UserRole } from '../user/enum/role.enum';

@Injectable({ scope: Scope.REQUEST })
export class TankerService {
    constructor(
        @InjectRepository(TankerEntity) private tankerRepository: Repository<TankerEntity>,
        private userService: UserService,
        private depotService: DepotService,
        @Inject(REQUEST) private req: Request
    ) { }

    async create(createTankerDto: CreateTankerDto) {
        try {
            const { id, parentId } = this.req.user
            const { capacity, driverId, number, plate } = createTankerDto
            await this.checkExistsDriver(driverId)
            await this.checkExistsTankerNumber(number)
            await this.checkExistsPlate(plate)
            const depot = await this.depotService.findOneByUserId(parentId ?? id)
            const driver = await this.userService.findOneById(driverId);
            if (driver.role !== UserRole.Driver) throw new BadRequestException('this user not identify as driver')
            const tanker = this.tankerRepository.create({ capacity, depotId: depot.id, plate, driverId, number })
            await this.tankerRepository.save(tanker)
            return {
                statusCode: HttpStatus.CREATED,
                message: TankerMessages.Create
            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const tankers = await this.tankerRepository.find({
                relations: { cargo: true },
                select: { id: true, number: true, plate: true, capacity: true, cargo: { tankerId: false } },
                order:{id:'DESC'}
            })
            return {
                statusCode: HttpStatus.OK,
                data: tankers
            }
        } catch (error) {
            throw error
        }
    }

    async driverTankerInfo() {
        try {
            const { id } = this.req.user
            const tanker = await this.tankerRepository.findOne({ where: { driverId: id }, relations: { cargo: true }, select: { cargo: { tankerId: false } } })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            throw error
        }
    }

    async findOne(id: number) {
        try {
            const tanker = await this.tankerRepository.findOne({ where: { id }, relations: { cargo: true }, select: { cargo: { tankerId: false } } })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            throw error
        }
    }
    async findOneByDriverId(driverId: number) {
        try {
            const tanker = await this.tankerRepository.findOne({
                where: { driverId },
                relations: { cargo: true }, select: { cargo: { tankerId: false } }
            })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            throw error
        }
    }
    async update(id: number, updateTankerDto: UpdateTankerDto) {
        try {
            const { capacity, plate, driverId, number } = updateTankerDto
            await this.getTankerById(id)
            if (driverId && driverId > 0) {
                await this.userService.findOneById(driverId);
            }
            if (plate) await this.checkExistsPlate(plate)
            if (number && number > 0) await this.checkExistsTankerNumber(number)
            const updateObject = RemoveNullProperty({ capacity, driverId, number })
            this.tankerRepository.update(id, updateObject)
            return {
                statusCode: HttpStatus.OK,
                message: TankerMessages.Update

            }
        } catch (error) {
            throw error
        }
    }

    async remove(id: number) {
        try {
            const tanker = await this.getTankerById(id)
            await this.tankerRepository.remove(tanker)
            return {
                statusCode: HttpStatus.OK,
                message: TankerMessages.Remove

            }
        } catch (error) {
            throw error
        }
    }

    // utils
    async getTankerById(id: number) {
        const tanker = await this.tankerRepository.findOneBy({ id })
        if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
        return tanker
    }
    async checkExistsDriver(driverId: number) {
        const tanker = await this.tankerRepository.findOne({ where: { driverId } })
        if (tanker) throw new ConflictException('this driver is already own a tanker')
        return true
    }
    async checkExistsTankerNumber(number: number) {
        const tanker = await this.tankerRepository.findOne({ where: { number } })
        if (tanker) throw new ConflictException('this driver is already own a tanker')
        return true
    }
    async checkExistsPlate(plate: string) {
        const tanker = await this.tankerRepository.findOne({ where: { plate } })
        if (tanker) throw new ConflictException('tanker with this plate is already exists')
        return true
    }
    async getByIdList(ids: number[]) {
        const tanker = await this.tankerRepository.find({ where: { id: In(ids) } })
        if (tanker.length < ids.length) throw new NotFoundException('tanker not found')
        return tanker
    }
}
