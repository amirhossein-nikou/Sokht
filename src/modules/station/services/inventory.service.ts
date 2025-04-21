import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { RemoveNullProperty } from "src/common/utils/update.utils";
import { UserService } from "src/modules/user/user.service";
import { CreateInventoryDto, UpdateInventoryDto } from "../dto/inventory.dto";
import { InventoryMessages } from "../enum/message.enum";
import { Repository } from "typeorm";
import { InventoryEntity } from "../entity/inventory.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/modules/user/enum/role.enum";
import { StationService } from "./station.service";
@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
    constructor(
        @InjectRepository(InventoryEntity) private inventoryRepository: Repository<InventoryEntity>,
        private stationService: StationService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createInventoryDto: CreateInventoryDto) {
        try {
            // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibW9iaWxlIjoiMDkxNzU1MDA3NjciLCJpYXQiOjE3NDQ5MDMwMDIsImV4cCI6MTc0NzQ5NTAwMn0.bd2c8hChc4--hHuq11EWaNpY4rXBELjjTstEqoLEhaw
            const { fuel_type, value, stationId } = createInventoryDto
            const { id } = this.req.user
            await this.stationService.findByUserStation(id, stationId)
            let inventory = await this.inventoryRepository.findOne({
                where: {
                    stationId, fuel_type,
                }
            })
            if (!inventory) {
                inventory = this.inventoryRepository.create({
                    fuel_type, value, stationId
                })
            } else {
                inventory.value = value
            }
            await this.inventoryRepository.save(inventory)
            return {
                status: HttpStatus.CREATED,
                data: { message: InventoryMessages.Created }
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
            const { fuel_type, value, stationId } = updateInventoryDto;
            const { id: userId } = this.req.user;
            if (stationId) await this.stationService.findByUserStation(id, stationId)
            const obj = RemoveNullProperty(updateInventoryDto)
            const inventory = await this.findOneById(id, userId);
            await this.inventoryRepository.update({ id: inventory.id }, obj)
            return {
                status: HttpStatus.OK,
                data: {
                    message: InventoryMessages.Update
                }
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
                data: {
                    message: InventoryMessages.Remove
                }
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
}