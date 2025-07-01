import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber } from 'class-validator';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EntityName } from 'src/common/enums/entity.enum';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { plateFormat } from 'src/common/utils/plate-format.utils';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { In, Repository } from 'typeorm';
import { DepotService } from '../depot/depot.service';
import { UserRole } from '../user/enum/role.enum';
import { UserService } from '../user/user.service';
import { CreatePlateDto, CreateTankerDto } from './dto/create-tanker.dto';
import { UpdatePlateDto, UpdateTankerDto } from './dto/update-tanker.dto';
import { PlateEntity } from './entities/plate.entity';
import { TankerEntity } from './entities/tanker.entity';
import { TankerMessages } from './enum/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class TankerService {
    constructor(
        @InjectRepository(TankerEntity) private tankerRepository: Repository<TankerEntity>,
        @InjectRepository(PlateEntity) private plateRepository: Repository<PlateEntity>,
        private userService: UserService,
        private depotService: DepotService,
        @Inject(REQUEST) private req: Request
    ) { }

    async create(createTankerDto: CreateTankerDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id, parentId } = this.req.user
            const { capacity, driverId, number, char, city, first, second } = createTankerDto
            await this.checkExistsDriver(driverId)
            await this.checkExistsTankerNumber(number)
            const depot = await this.depotService.findOneByUserId(parentId ?? id)
            const driver = await this.userService.findOneById(driverId);
            if (driver.role !== UserRole.Driver) throw new BadRequestException('this user not identify as driver')
            const plate = await this.createPlate({ char, city, first, second })
            const tanker = this.tankerRepository.create({ capacity, depotId: depot.id, driverId, number, plateId: plate.id })
            const result = await this.tankerRepository.save(tanker)
            return {
                statusCode: HttpStatus.CREATED,
                message: TankerMessages.Create,
                data: {
                    plate,
                    tanker: result
                }
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async createPlate(createPlateDto: CreatePlateDto) {
        const { char, city, first, second } = createPlateDto
        const fullPlate = plateFormat(createPlateDto)
        await this.checkExistsPlate(fullPlate)
        const newPlate = this.plateRepository.create({ char, city, first, second, full_plate: fullPlate })
        return await this.plateRepository.save(newPlate)
    }
    async findAll(search: string, paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            let where: string = ''
            if (search) {
                if (isNumber(Number(search))) {
                    where = 'tanker.number = :search OR tanker.capacity = :search'
                } else {
                    search = `%${search}%`
                    where = 'CONCAT(driver.first_name,driver.last_name) ILIKE :search'
                }
            }
            const [tankers, count] = await this.tankerRepository.createQueryBuilder(EntityName.Tanker)
                .leftJoin('tanker.cargo', 'cargo')
                .leftJoin('tanker.driver', 'driver')
                .leftJoin('tanker.plate', 'plate')
                .select([
                    'tanker.id', 'tanker.number', 'plate', 'tanker.capacity', 'tanker.available',
                    'cargo.requestId', 'cargo.rejectId', 'cargo.inProgress', 'cargo.created_at', 'cargo.rejectDetails',
                    'driver.first_name', 'driver.last_name', 'driver.id', 'driver.mobile', 'driver.national_code'
                ])
                .where(where, { search })
                .orderBy('tanker.id', 'DESC')
                .offset(skip)
                .limit(limit)
                .getManyAndCount()
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: tankers
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findFreeTankers(capacity: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const tankers = await this.tankerRepository.find(
                {
                    where: { capacity },
                    relations: {
                        //cargo: true,
                        plate: true,
                        driver: true
                    },
                    select: {
                        cargo: { tankerId: false },
                        driver: {last_name: true,first_name: true,id: true}
                    }
                })
            if (tankers.length <= 0) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tankers
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async availableTankers() {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id } = this.req.user
            const availableTankers = await this.tankerRepository.find({
                where: {
                    depot: { ownerId: id },
                    available: true
                }
            })
            const tankers = await this.tankerRepository.find({
                where: {
                    depot: { ownerId: id },
                }
            })
            return {
                allTankers: tankers.length,
                availableTankers: availableTankers.length,
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async driverTankerInfo() {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id } = this.req.user
            const tanker = await this.tankerRepository.findOne({
                where: { driverId: id },
                relations: { cargo: true }, select: { cargo: { tankerId: false } }
            })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async findOne(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const tanker = await this.tankerRepository.findOne({ where: { id }, relations: { cargo: true, plate: true }, select: { cargo: { tankerId: false } } })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async findOneByDriverId(driverId: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const tanker = await this.tankerRepository.findOne({
                where: { driverId },
                relations: { cargo: true, plate: true }, select: { cargo: { tankerId: false } }
            })
            if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    async findByRequestIdAndroid(requestId: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const tanker = await this.tankerRepository.find({
                where: { cargo: { requestId } },
                relations: { cargo: true }, select: { cargo: { tankerId: false } }
            })
            if (!tanker || tanker.length == 0) throw new NotFoundException(TankerMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: tanker
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async update(id: number, updateTankerDto: UpdateTankerDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { capacity, driverId, number, char, city, first, second } = updateTankerDto
            const tanker = await this.getTankerById(id)
            if (driverId && driverId > 0) {
                await this.userService.findOneById(driverId);
            }
            if (number && number > 0) await this.checkExistsTankerNumber(number)
            const updateObject = RemoveNullProperty({ capacity, driverId, number })
            await this.updatePlate(tanker.plateId, { char, city, first, second })
            if (updateObject) {
                await this.tankerRepository.update(id, updateObject)
            }
            const result = await this.getTankerById(id)
            return {
                statusCode: HttpStatus.OK,
                message: TankerMessages.Update,
                data: result

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async updatePlate(id: number, updatePlateDto: UpdatePlateDto) {
        let { char, city, first, second } = updatePlateDto
        const plate = await this.getPlateById(id)
        // if (!char) char = plate.char
        // if (!city) city = plate.city
        // if (!first) first = plate.first
        // if (!second) second = plate.second
        const fullPlate = plateFormat({
            char: char ?? plate.char,
            city: city ?? plate.city,
            first: first ?? plate.first,
            second: second ?? plate.second
        })
        await this.checkExistsPlate(fullPlate)
        const updateObject = RemoveNullProperty({ char, city, first, second, full_plate: fullPlate })
        if (updateObject) {
            await this.plateRepository.update(id, updateObject)
        }
    }
    async remove(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const tanker = await this.getTankerById(id)
            await this.tankerRepository.remove(tanker)
            return {
                statusCode: HttpStatus.OK,
                message: TankerMessages.Remove

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }

    // utils
    async updateStatusByTakerList(tankers: TankerEntity[], available: boolean) {
        tankers.map(async tanker => {
            await this.tankerRepository.update({ id: tanker.id }, { available })
        })
    }
    async getTankerById(id: number) {
        const tanker = await this.tankerRepository.findOne({ where: { id }, relations: { plate: true } })
        if (!tanker) throw new NotFoundException(TankerMessages.Notfound)
        return tanker
    }
    async checkExistsDriver(driverId: number) {
        const tanker = await this.tankerRepository.findOne({ where: { driverId } })
        if (tanker) throw new ConflictException('this driver is already own a tanker')
        return true
    }
    async checkExistsPlate(fullPlate: string) {
        const plate = await this.plateRepository.findOneBy({ full_plate: fullPlate })
        if (plate) throw new BadRequestException('plate already exists')
    }
    async checkExistsTankerNumber(number: number) {
        const tanker = await this.tankerRepository.findOne({ where: { number } })
        if (tanker) throw new ConflictException('this driver is already own a tanker')
        return true
    }
    async getByIdList(ids: number[]) {
        const tanker = await this.tankerRepository.find({ where: { id: In(ids), available: true } })
        if (tanker.length < ids.length) throw new NotFoundException('tanker not found')
        return tanker
    }
    async getPlateById(id: number) {
        const plate = await this.plateRepository.findOneBy({ id })
        if (!plate) throw new NotFoundException('plate not found')
        return plate
    }
}
