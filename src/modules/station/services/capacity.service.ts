import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { RemoveNullProperty } from "src/common/utils/update.utils";
import { UserRole } from "src/modules/user/enum/role.enum";
import { Repository } from "typeorm";
import { CreateCapacityDto, UpdateCapacityDto } from "../dto/capacity.dto";
import { CapacityEntity } from "../entity/capacity.entity";
import { CapacityMessages } from "../enum/message.enum";
import { StationService } from "./station.service";
@Injectable({ scope: Scope.REQUEST })
export class CapacityService {
    constructor(
        @InjectRepository(CapacityEntity) private capacityRepository: Repository<CapacityEntity>,
        private stationService: StationService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createCapacityDto: CreateCapacityDto) {
        try {
            const { fuel_type, value, stationId } = createCapacityDto
            const { id } = this.req.user
            await this.stationService.findByUserStation(id, stationId)
            let capacity = await this.capacityRepository.findOne({
                where: {
                    stationId, fuel_type,
                }
            })
            if (!capacity) {
                capacity = this.capacityRepository.create({
                    fuel_type, value, stationId
                })
            } else {
                capacity.value = value
            }
            await this.capacityRepository.save(capacity)
            return {
                status: HttpStatus.CREATED,
                data: { message: CapacityMessages.Created }
            }
        } catch (error) {
            throw error
        }
    }
    async findAll() {
        try {
            const { id, role } = this.req.user
            let where: object = {
                station: {
                    ownerId: id
                }
            }
            if (role === UserRole.HeadUser) {
                where = {}
            }
            const inventories = await this.capacityRepository.find({ where })
            return {
                status: HttpStatus.OK,
                data: inventories
            }
        } catch (error) {
            throw error
        }
    }
    async findOne(id: number) {
        try {
            const { id: userId, role } = this.req.user
            let where: object = {
                id,
                station: {
                    ownerId: userId
                }
            }
            if (role === UserRole.HeadUser) {
                where = { id }
            }
            const capacity = await this.capacityRepository.findOne({where});
            if (!capacity) throw new NotFoundException(CapacityMessages.NotFound)
            return {
                status: HttpStatus.OK,
                data: capacity
            }
        } catch (error) {
            throw error
        }
    }
    async update(id: number, updateCapacityDto: UpdateCapacityDto) {
        try {
            const { fuel_type, value, stationId } = updateCapacityDto;
            const { id: userId } = this.req.user;
            if (stationId) await this.stationService.findByUserStation(id, stationId)
            const obj = RemoveNullProperty(updateCapacityDto)
            const capacity = await this.findOneById(id, userId);
            await this.capacityRepository.update({ id: capacity.id }, obj)
            return {
                status: HttpStatus.OK,
                data: {
                    message: CapacityMessages.Update
                }
            }
        } catch (error) {
            throw error
        }
    }
    async remove(id: number) {
        try {
            const { id: userId } = this.req.user
            const capacity = await this.findOneById(id, userId)
            await this.capacityRepository.remove(capacity)
            return {
                status: HttpStatus.OK,
                data: {
                    message: CapacityMessages.Remove
                }
            }
        } catch (error) {
            throw error
        }
    }
    async capacityStatusToggle(id: number) {
        try {
            const capacity = await this.findById(id)
            let message = ''
            if (capacity.status) {
                capacity.status = false
                message = 'capacity status change to false'
            } else {
                capacity.status = true
                message = 'capacity status change to true'
            }
            await this.capacityRepository.save(capacity)
            return {
                statusCode: HttpStatus.OK,
                data: { message }
            }
        } catch (error) {
            throw error
        }
    }
    // utils
    async findOneById(id: number, ownerId: number) {
        const capacity = await this.capacityRepository.findOne({
            where: {
                id, station: { ownerId }
            }
        });
        if (!capacity) throw new NotFoundException(CapacityMessages.NotFound)
        return capacity
    }
    async findById(id: number) {
        const capacity = await this.capacityRepository.findOne({
            where: {
                id,
            }
        });
        if (!capacity) throw new NotFoundException(CapacityMessages.NotFound)
        return capacity
    }
}