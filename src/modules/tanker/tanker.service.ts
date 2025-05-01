import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { DepotService } from '../depot/depot.service';
import { UserService } from '../user/user.service';
import { CreateTankerDto } from './dto/create-tanker.dto';
import { UpdateTankerDto } from './dto/update-tanker.dto';
import { TankerEntity } from './entities/tanker.entity';
import { TankerMessages } from './enum/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { CargoService } from '../cargo/cargo.service';

@Injectable({ scope: Scope.REQUEST })
export class TankerService {
    constructor(
        @InjectRepository(TankerEntity) private tankerRepository: Repository<TankerEntity>,
        private userService: UserService,
        private depotService: DepotService,
        private cargoService: CargoService,
        @Inject(REQUEST) private req: Request
    ) { }

    async create(createTankerDto: CreateTankerDto) {
        try {
            const { capacity, depotId, driverId, number, cargoId } = createTankerDto
            await this.checkExistsDriver(depotId)
            await this.checkExistsTankerNumber(number)
            await this.userService.findOneById(driverId);
            await this.depotService.findOneById(depotId);
            if (cargoId) await this.cargoService.getOneById(cargoId);
            const tanker = this.tankerRepository.create({ capacity, depotId, driverId, number, cargoId })
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
            const tankers = await this.tankerRepository.find()
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
            const tanker = await this.tankerRepository.findOne({ where: { driverId: id } })
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
            const tanker = await this.tankerRepository.findOneBy({ id })
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
            const tanker = await this.tankerRepository.findOneBy({ driverId })
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
            const { capacity, depotId, driverId, number, cargoId } = updateTankerDto
            await this.getTankerById(id)
            if (driverId && driverId > 0) {
                await this.checkExistsDriver(depotId)
                await this.userService.findOneById(driverId);
            }
            if (depotId && depotId > 0) await this.depotService.findOneById(depotId);
            if (cargoId && cargoId > 0) await this.cargoService.getOneById(cargoId);
            if(number && number > 0) await this.checkExistsTankerNumber(number)
            const updateObject = RemoveNullProperty({ capacity, depotId, driverId, number, cargoId })
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
}
