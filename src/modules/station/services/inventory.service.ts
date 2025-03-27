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
@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
    constructor(
        @InjectRepository(InventoryEntity) private inventoryRepository: Repository<InventoryEntity>,
        private userService: UserService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createInventoryDto: CreateInventoryDto) {
        const { fuel_type, value } = createInventoryDto
        const { id } = this.req.user
        const stationId = await this.userService.findUserStationId(id)
        const inventory = this.inventoryRepository.create({
            fuel_type, value, stationId
        })
        await this.inventoryRepository.save(inventory)
        return {
            status: HttpStatus.CREATED,
            data: { message: InventoryMessages.Created }
        }
    }
    async findAll() {
        const { id } = this.req.user
        const stationId = await this.userService.findUserStationId(id)
        const inventories = await this.inventoryRepository.find({
            where: {
                stationId: stationId || null
            }
        })
        return {
            status: HttpStatus.OK,
            data: inventories
        }
    }
    async findOne(id: number) {
        const { id: userId } = this.req.user
        const stationId = await this.userService.findUserStationId(id)
        const inventory = await this.inventoryRepository.findOne({
            where: {
                id,
                stationId: stationId || null
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return {
            status: HttpStatus.OK,
            data: inventory
        }
    }
    async update(id: number, updateInventoryDto: UpdateInventoryDto) {
        const { fuel_type, value } = updateInventoryDto;
        const { id: userId } = this.req.user;
        const obj = RemoveNullProperty(updateInventoryDto)
        const stationId = await this.userService.findUserStationId(userId)
        const inventory = await this.findOneById(id, stationId);
        await this.inventoryRepository.update(id, obj)
        return {
            status: HttpStatus.OK,
            data: {
                message: InventoryMessages.Update
            }
        }
    }
    async remove(id: number) {
        const { id: userId } = this.req.user
        const stationId = await this.userService.findUserStationId(userId)
        const inventory = await this.findOneById(id, stationId)
        await this.inventoryRepository.remove(inventory)
        return {
            status: HttpStatus.OK,
            data: {
                message: InventoryMessages.Remove
            }
        }
    }
    // utils
    async findOneById(id: number, stationId: number) {
        const inventory = await this.inventoryRepository.findOne({
            where: {
                id, stationId
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
}