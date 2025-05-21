import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { RemoveNullProperty } from "../../../common/utils/update.utils";
import { FuelTypeService } from "../../../modules/fuel-type/fuel-type.service";
import { UserRole } from "../../../modules/user/enum/role.enum";
import { UserService } from "../../../modules/user/user.service";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { CreateInventoryDto, UpdateInventoryDto, UpdateValue } from "../dto/inventory.dto";
import { InventoryEntity } from "../entity/inventory.entity";
import { InventoryMessages } from "../enum/message.enum";
import { StationService } from "./station.service";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.utils";
@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
    constructor(
        @InjectRepository(InventoryEntity) private inventoryRepository: Repository<InventoryEntity>,
        private stationService: StationService,
        private userService: UserService,
        private fuelTypeService: FuelTypeService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createInventoryDto: CreateInventoryDto) {
        try {
            const { fuel_type, stationId, max, name } = createInventoryDto
            const { id, role } = this.req.user
            const station = await this.stationService.findOneById(stationId)
            await this.fuelTypeService.getById(fuel_type)
            await this.stationService.checkExistsFuelType(station.id, fuel_type)
            let inventory = this.inventoryRepository.create({
                name,
                fuel_type,
                stationId,
                max
            })
            await this.inventoryRepository.save(inventory)
            return {
                status: HttpStatus.CREATED,
                message: InventoryMessages.Created
            }
        } catch (error) {
            throw error
        }
    }
    async findAll(paginationDto: PaginationDto) {
        try {
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id, role, parentId } = this.req.user
            let where: object = {
                station: {
                    ownerId: parentId ?? id
                }
            }
            if (role !== UserRole.StationUser) {
                where = {}
            }
            const [inventories,count] = await this.inventoryRepository.findAndCount({
                where,
                take: limit,
				skip,
                select: {
                    id: true,
                    status: true,
                    name: true,
                    value: true,
                    updated_at: true,
                    fuels: {
                        name: true,
                        id: true
                    }
                }
            })
            return {
                status: HttpStatus.OK,
                pagination: paginationGenerator(limit,page,count),
                data: inventories
            }
        } catch (error) {
            throw error
        }
    }
    async findListOfLastUpdates(paginationDto: PaginationDto) {
        try {
            const { limit, page, skip } = paginationSolver(paginationDto)
            const filterTime = new Date(Date.now() - 1000 * 60 * 60 * 4) //last 4 hours
            const { id, role, parentId } = this.req.user
            let where: object = {
                updated_at: LessThanOrEqual(filterTime),
                station: {
                    ownerId: parentId ?? id
                }
            }
            if (role !== UserRole.StationUser) {
                where = { updated_at: LessThanOrEqual(filterTime) }
            }
            const [inventories,count] = await this.inventoryRepository.findAndCount({
                where,
                take: limit,
				skip,
                select: {
                    id: true,
                    status: true,
                    name: true,
                    value: true,
                    updated_at: true,
                    fuels: {
                        name: true,
                        id: true
                    }
                }
            })
            return {
                status: HttpStatus.OK,
                pagination: paginationGenerator(limit,page,count),
                data: inventories
            }
        } catch (error) {
            throw error
        }
    }
    async findOne(id: number) {
        try {
            const { id: userId, role, parentId } = this.req.user
            let where: object = {
                id,
                station: {
                    ownerId: parentId ?? userId
                }
            }
            if (role !== UserRole.StationUser) {
                where = { id }
            }
            const inventory = await this.inventoryRepository.findOne({ where });
            if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
            return {
                status: HttpStatus.OK,
                data: inventory
            }
        } catch (error) {
            throw error
        }
    }
    async update(id: number, updateInventoryDto: UpdateInventoryDto) {
        try {
            const { fuel_type, stationId, max } = updateInventoryDto;
            const { id: userId } = this.req.user;
            const inventory = await this.findOneById(id, userId);
            if (inventory.status == false) throw new BadRequestException('inventory is deActive')
            if (stationId) await this.stationService.findOneById(stationId)
            if (fuel_type) {
                await this.fuelTypeService.getById(fuel_type)
            }
            if (fuel_type && stationId) await this.stationService.checkExistsFuelType(stationId, fuel_type)
            const obj = RemoveNullProperty(updateInventoryDto)
            await this.inventoryRepository.update({ id: inventory.id }, obj)
            return {
                status: HttpStatus.OK,
                message: InventoryMessages.Update
            }
        } catch (error) {
            throw error
        }
    }
    async updateValue(id: number, updateValue: UpdateValue) {
        try {
            const { value } = updateValue;
            const { id: userId } = this.req.user;
            const inventory = await this.findById(id);
            if (value > inventory.max) throw new BadRequestException('value cant be more than max capacity')
            if (inventory.status == false) throw new BadRequestException('inventory is deActive')
            const obj = RemoveNullProperty(updateValue)
            await this.inventoryRepository.update({ id: inventory.id }, obj)
            return {
                status: HttpStatus.OK,
                message: InventoryMessages.Update
            }
        } catch (error) {
            throw error
        }
    }
    async remove(id: number) {
        try {
            const { id: userId } = this.req.user
            const inventory = await this.findById(id)
            await this.inventoryRepository.remove(inventory)
            return {
                status: HttpStatus.OK,
                message: InventoryMessages.Remove

            }
        } catch (error) {
            throw error
        }
    }
    async statusToggle(id: number) {
        try {
            const userId = this.req.user.id
            await this.userService.checkIfParent(userId)
            const inventory = await this.findById(id)
            let message = ''
            if (inventory.status) {
                inventory.status = false
                message = 'inventory Deactivated.'
            } else {
                inventory.status = true
                message = 'inventory Got activated.'
            }
            await this.inventoryRepository.save(inventory)
            return {
                statusCode: HttpStatus.OK,
                message
            }
        } catch (error) {
            throw error
        }
    }
    // utils
    async findOneById(id: number, ownerId: number) {
        const inventory = await this.inventoryRepository.findOne({
            where: {
                id, station: { ownerId }
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async findById(id: number) {
        const inventory = await this.inventoryRepository.findOne({
            where: {
                id,
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async findByStationIdAndFuel(stationId: number, fuelType: number) {
        const inventory = await this.inventoryRepository.find({
            where: {
                status: true,
                stationId,
                fuel_type: fuelType
            }
        });
        //if (!inventory || inventory.length == 0) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async findAllUserInventories(ownerId: number) {
        const inventory = await this.inventoryRepository.find({
            where: {
                station: { ownerId }
            },
            relations: {station: {fuels: true}}
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
}