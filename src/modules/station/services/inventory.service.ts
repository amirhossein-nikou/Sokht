import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/sequelize";
import { Request } from "express";
import { RemoveNullProperty } from "src/common/utils/update.utils";
import { UserService } from "src/modules/user/user.service";
import { CreateInventoryDto, UpdateInventoryDto } from "../dto/inventory.dto";
import { InventoryMessages } from "../enum/message.enum";
import { InventoryModel } from "../models/inventory.model";
@Injectable({ scope: Scope.REQUEST })
export class InventoryService {
    constructor(
        @InjectModel(InventoryModel) private inventoryModel: typeof InventoryModel,
        private userService: UserService,
        @Inject(REQUEST) private req: Request
    ) { }
    async create(createInventoryDto: CreateInventoryDto) {
        const { fuel_type, value } = createInventoryDto
        const { id } = this.req.user
        const stationId = await this.userService.findUserStationId(id)
        this.inventoryModel.create({
            fuel_type,value ,stationId
        })
        return {
            status: HttpStatus.CREATED,
            data: { message: InventoryMessages.Created }
        }
    }
    async findAll() {
        const { id } = this.req.user
        const stationId = await this.userService.findUserStationId(id)
        const inventories = await this.inventoryModel.findAll({
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
        const inventory = await this.inventoryModel.findOne({
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
        await inventory.update(obj)
        return {
            status: HttpStatus.OK,
            data: {
                message: InventoryMessages.Update
            }
        }
    }
    async remove(id: number) {
        const { id:userId } = this.req.user
        const stationId = await this.userService.findUserStationId(userId)
        const inventory = await this.findOneById(id, stationId)
        await inventory.destroy()
        return {
            status: HttpStatus.OK,
            data: {
                message: InventoryMessages.Remove
            }
        }
    }
    // utils
    async findOneById(id: number, stationId: number) {
        const inventory = await this.inventoryModel.findOne({
            where: {
                id, stationId
            }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
}