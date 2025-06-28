import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CargoEntity } from './entities/cargo.entity';
import { Repository } from 'typeorm';
import { RequestService } from '../request/request.service';
import { CargoMessages } from './enums/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { StatusEnum } from 'src/common/enums/status.enum';
import { getIdList } from 'src/common/utils/id.utils';
import { StringToArray } from 'src/common/utils/stringToArray.utils';
import { TankerService } from '../tanker/tanker.service';
import { RejectDto } from 'src/common/dto/create-reject.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { NotificationGateway } from '../notification/notification.gateway';
import * as moment from 'jalali-moment';

@Injectable()
export class CargoService {
    constructor(
        @InjectRepository(CargoEntity) private cargoRepository: Repository<CargoEntity>,
        private tankerService: TankerService,
        private requestService: RequestService,
        private notification: NotificationGateway,
    ) { }
    async create(createCargoDto: CreateCargoDto) {
        const { requestId, tankerId, receive_at, value } = createCargoDto
        try {
            const now = new Date().toISOString()
            //if (dispatch_time.toString() <= now) throw new BadRequestException('dispatch_time is less than current time')
            const tankerIdList = getIdList(StringToArray(tankerId))
            const tankers = await this.tankerService.getByIdList(tankerIdList)
            const request = await this.requestService.getOneById(requestId)
            if (request.statusId !== StatusEnum.Approved)
                throw new BadRequestException('you can create cargo for approved requests')
            if (request.receive_at !== receive_at) {
                await this.requestService.updateOnCreateCargo(request.id, { receive_at })
            }
            if (request.value !== value) {
                await this.requestService.updateOnCreateCargo(request.id, { value })
            }
            await this.checkExistsRequestId(requestId)
            const cargo = this.cargoRepository.create({
                requestId, tankers, tankerId: tankerIdList
            })
            const data = await this.cargoRepository.save(cargo)
            await this.requestService.licenseRequest(requestId)
            const result = await this.getOneById(data.id)
            await this.notification.notificationHandler({
                title: `محموله شماره ${cargo.id} حاوی ${value} لیتر ${request.fuel.name} برای شما ارسال شد`,
                description: `محموله شماره ${cargo.id} حاوی ${request.value} لیتر ${request.fuel.name} در تاریخ ${moment(cargo.created_at).locale('fa').format('jYYYY-jMM-jDD')} ساعت ${moment(cargo.created_at).locale('fa').format('HH:mm')} برای شما ارسال شد.
                لطفا پس از دریافت، بر روی "دکمه تایید" تحویل در صفحه ی داشبورد کلیک کنید`,
                userId: request.station.ownerId,
                parentId: request.station.ownerId
            })
            await this.tankerService.updateStatusByTakerList(tankers, false)
            return {
                statusCode: HttpStatus.CREATED,
                message: CargoMessages.Create,
                data: result
            }
        } catch (error) {
            throw error
        }
    }

    async findAll(paginationDto: PaginationDto) {
        try {
            const { limit, page, skip } = paginationSolver(paginationDto)
            const [cargoes, count] = await this.cargoRepository.findAndCount({
                where: { rejectDetails: null },
                relations: {
                    request: {
                        status: true
                    }
                },
                take: limit,
                skip
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: cargoes
            }
        } catch (error) {
            throw error
        }
    }
    async findWithFuelType(fuel_type: number, paginationDto: PaginationDto) {
        try {
            const { limit, page, skip } = paginationSolver(paginationDto)
            let where: Object = { rejectDetails: null }
            if (fuel_type) {
                where = {
                    rejectDetails: null,
                    request: { fuel_type }
                }
            }
            const [cargoes, count] = await this.cargoRepository.findAndCount({
                relations: {
                    request: {
                        status: true,
                        station: true
                    },
                    tankers: { driver: true }
                },
                where,
                select: {
                    request: {
                        id: true,
                        value: true,
                        receive_at: true,
                        station: { name: true, id: true }
                    },
                    tankers: {
                        id: true, number: true,
                        driver: { id: true, first_name: true, last_name: true, mobile: true, national_code: true, }
                    }
                },
                take: limit,
                skip
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
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
                relations: {
                    request: {
                        status: true,
                        station: true,
                    },
                },
                select: {
                    request: {
                        id: true,
                        priority: true,
                        value: true,
                        depotId: true,
                        receive_at: true,
                        created_at: true,
                        priority_value: true,
                        rejectDetails: {
                            title: true,
                            description: true
                        },
                        station: {
                            id: true,
                            name: true
                        }
                    }
                }
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
            const { requestId, receive_at, tankerId, value } = updateCargoDto
            const now = new Date().toISOString()
            const cargo = await this.getOneById(id)
            if (requestId) {
                const request = await this.requestService.getOneById(requestId)
                if (request.statusId !== StatusEnum.Approved)
                    throw new BadRequestException('this request is not approved yet')
                await this.checkExistsRequestId(requestId)
            }
            let updateObject = RemoveNullProperty({ tankerId, requestId })
            if (updateObject) {
                await this.cargoRepository.update(id, updateObject)
            }
            await this.requestService.updateOnCreateCargo(requestId ?? cargo.requestId, { receive_at, value })
            const result = await this.getOneById(id)
            return {
                statusCode: HttpStatus.OK,
                message: CargoMessages.Update,
                data: result
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

    async rejectCargo(id: number, rejectDto: RejectDto) {
        try {
            const { description, title } = rejectDto
            const cargo = await this.getOneById(id)
            if (cargo.rejectDetails) throw new BadRequestException("this cargo already rejected")
            await this.cargoRepository.update(id, {
                rejectDetails: { title, description }
            })
            await this.tankerService.updateStatusByTakerList(cargo.tankers, true)
            return {
                statusCode: HttpStatus.OK,
                message: "cargo rejected successfully"
            }
        } catch (error) {
            throw error
        }
    }
    // utils
    async getOneById(id: number) {
        const cargo = await this.cargoRepository.findOne({ where: { id }, relations: { tankers: true, request: true } })
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
            where: { inProgress: true },
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
                    driver: { id: true, first_name: true, last_name: true, mobile: true }
                }
            }
        })
        if (!cargo) throw new NotFoundException(CargoMessages.Notfound)
        return cargo
    }
}
