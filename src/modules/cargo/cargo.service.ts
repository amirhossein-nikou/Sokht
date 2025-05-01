import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CargoEntity } from './entities/cargo.entity';
import { Repository } from 'typeorm';
import { RequestService } from '../request/request.service';
import { CargoMessages } from './enums/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';

@Injectable()
export class CargoService {
    constructor(
        @InjectRepository(CargoEntity) private cargoRepository: Repository<CargoEntity>,
        private requestService: RequestService
    ) { }
    async create(createCargoDto: CreateCargoDto) {
        try {
            const { arrival_time, dispatch_time, requestId } = createCargoDto
            await this.requestService.getOneById(requestId)
            await this.checkExistsRequestId(requestId)
            const now = new Date().toISOString()
            if (arrival_time.toString() <= now) throw new BadRequestException('arrival_time is less than current time')
            if (dispatch_time.toString() <= now) throw new BadRequestException('dispatch_time is less than current time')
            const cargo = this.cargoRepository.create({
                arrival_time, dispatch_time, requestId
            })
            await this.cargoRepository.save(cargo)
            return {
                statusCode: HttpStatus.CREATED,
                message: CargoMessages.Create
            }
        } catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            const cargoes = await this.cargoRepository.find({
                relations: {
                    request: {
                        status: true
                    }
                }
            })
            return {
                statusCode: HttpStatus.OK,
                data: cargoes
            }
        } catch (error) {
            throw error
        }
    }

    async findOne(id: number) {
        try {
            const cargo = await this.cargoRepository.findOne({
                where: { id },
            })
            if (!cargo) throw new NotFoundException(CargoMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: cargo
            }
        } catch (error) {
            throw error
        }
    }

    async update(id: number, updateCargoDto: UpdateCargoDto) {
        try {
            const { arrival_time, dispatch_time, requestId } = updateCargoDto
            const now = new Date().toISOString()
            if (arrival_time && arrival_time.toString() <= now)
                throw new BadRequestException('arrival_time is less than current time')
            if (dispatch_time && dispatch_time.toString() <= now)
                throw new BadRequestException('dispatch_time is less than current time')
            await this.getOneById(id)
            if (requestId) {
                await this.requestService.getOneById(requestId)
                await this.checkExistsRequestId(requestId)
            }
            let updateObject = RemoveNullProperty(updateCargoDto)
            if (Object.keys(updateObject).length == 0) {
                throw new BadRequestException('update failed')
            }
            await this.cargoRepository.update(id, updateObject)
            return {
                statusCode: HttpStatus.OK,

                message: CargoMessages.Update

            }
        } catch (error) {
            throw error
        }
    }

    async remove(id: number) {
        try {
            const cargo = await this.getOneById(id)
            await this.cargoRepository.remove(cargo)
            return {
                statusCode: HttpStatus.OK,
                message: CargoMessages.Remove

            }
        } catch (error) {
            throw error
        }
    }

    // utils
    async getOneById(id: number) {
        const cargo = await this.cargoRepository.findOneBy({ id })
        if (!cargo) throw new NotFoundException(CargoMessages.Notfound)
        return cargo
    }
    async checkExistsRequestId(requestId: number) {
        const cargo = await this.cargoRepository.findOneBy({ requestId })
        if (cargo) throw new NotFoundException('cargo for this request already exists')
        return false
    }
    async findCargoWithDetails() {
        const cargo = await this.cargoRepository.find({
            relations: {
                request: true,
                tankers: {
                    driver: true,
                    depot: true
                }
            },
            select: {
                tankers: {
                    id: true,
                    depot: { name: true, id: true },
                    driver: { first_name: true, last_name: true, mobile: true }
                }
            }
        })
        if (!cargo) throw new NotFoundException(CargoMessages.Notfound)
        return cargo
    }
}
