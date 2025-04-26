import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { RemoveNullProperty } from "src/common/utils/update.utils";
import { UserRole } from "src/modules/user/enum/role.enum";
import { Repository } from "typeorm";
import { CreateInventoryDto, UpdateInventoryDto } from "../dto/inventory.dto";
import { InventoryEntity } from "../entity/inventory.entity";
import { InventoryMessages } from "../enum/message.enum";
import { StationService } from "./station.service";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { UserService } from "src/modules/user/user.service";
@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
    constructor(
        @InjectRepository(InventoryEntity) private inventoryRepository: Repository<InventoryEntity>,
        private stationService: StationService,
        private userService: UserService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createInventoryDto: CreateInventoryDto) {
        try {
            const { fuel_type, value, stationId, max } = createInventoryDto
            const { id } = this.req.user
            await this.stationService.findByUserStation(id, stationId)
            let inventory = this.inventoryRepository.create({
                fuel_type, value, stationId, max
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
            const inventories = await this.inventoryRepository.find({ where })
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
                station: {
                    id,
                    ownerId: userId
                }
            }
            if (role === UserRole.HeadUser) {
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
            const { fuel_type, value, stationId, max } = updateInventoryDto;
            const { id: userId } = this.req.user;
            if (stationId) await this.stationService.findByUserStation(id, stationId)
            const obj = RemoveNullProperty(updateInventoryDto)
            const inventory = await this.findOneById(id, userId);
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
            const inventory = await this.findOneById(id, userId)
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
                message = 'capacity status change to false'
            } else {
                inventory.status = true
                message = 'capacity status change to true'
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
    async findByStationIdAndFuel(stationId: number, fuelType: FuelTypes) {
        const inventory = await this.inventoryRepository.find({
            where: {
                stationId,
                fuel_type: fuelType
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async findAllUserInventories(ownerId: number) {
        const inventory = await this.inventoryRepository.find({
            where: {
                station: { ownerId }
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
}