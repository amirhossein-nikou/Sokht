import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.utils";
import { LessThanOrEqual, Repository } from "typeorm";
import { RemoveNullProperty } from "../../../common/utils/update.utils";
import { FuelTypeService } from "../../../modules/fuel-type/fuel-type.service";
import { UserRole } from "../../../modules/user/enum/role.enum";
import { UserService } from "../../../modules/user/user.service";
import { CreateInventoryDto, UpdateInventoryDto, UpdateValue } from "../dto/inventory.dto";
import { InventoryEntity } from "../entity/inventory.entity";
import { StationEntity } from "../entity/station.entity";
import { InventoryMessages } from "../enum/message.enum";
import { StationService } from "./station.service";
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
            console.log(`access  -> ${this.req.url}`);
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
            const result = await this.inventoryRepository.save(inventory)
            return {
                statusCode: HttpStatus.CREATED,
                message: InventoryMessages.Created,
                data: result
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findAll(paginationDto: PaginationDto, stationId: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id, role, parentId } = this.req.user
            let where: object = {
                station: {
                    ownerId: parentId ?? id
                }
            }
            if (role !== UserRole.StationUser) {
                where = { stationId: stationId ?? null}
            }
            const [inventories, count] = await this.inventoryRepository.findAndCount({
                where,
                take: limit,
                skip,
                select: {
                    id: true,
                    status: true,
                    stationId: true,
                    name: true,
                    value: true,
                    updated_at: true,
                    max: true,
                    fuels: {
                        name: true,
                        id: true
                    }
                }
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: inventories
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findListOfLastUpdates(paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const { id, role, parentId } = this.req.user
            const filterTime = new Date(Date.now() - 1000 * 60 * 60 * 4) //last 4 hours
            let where: object = {
                updated_at: LessThanOrEqual(filterTime),
                status: true,
                station: {
                    ownerId: parentId ?? id
                }
            }
            if (role !== UserRole.StationUser) {
                where = { updated_at: LessThanOrEqual(filterTime), status: true, }
            }
            const [inventories, count] = await this.inventoryRepository.findAndCount({
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
            console.log(inventories[1].updated_at < filterTime);
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: inventories
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findListOfLastUpdatesAndroid(paginationDto: PaginationDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { limit, page, skip } = paginationSolver(paginationDto)
            const filterTime = new Date(Date.now() - 1000 * 60 * 60 * 4) //last 4 hours

            const { id, role, parentId } = this.req.user
            let where: object = {
                updated_at: LessThanOrEqual(filterTime),
                status: true,
                station: {
                    ownerId: parentId ?? id
                }
            }
            if (role !== UserRole.StationUser) {
                where = { updated_at: LessThanOrEqual(filterTime), status: true }
            }
            const [inventories, count] = await this.inventoryRepository.findAndCount({
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
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: inventories
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findAllInventoryDetails(fuelType: number) {
        try {
            //depot user
            console.log(`access  -> ${this.req.url}`);
            const station = await this.stationService.getAllStations()
            const detailsList = await this.getSomeDetailsOfInventory(station, fuelType)
            return {
                data: detailsList
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async findOne(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
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
                statusCode: HttpStatus.OK,
                data: inventory
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async update(id: number, updateInventoryDto: UpdateInventoryDto) {
        try {
            console.log(`access  -> ${this.req.url}`);
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
            const result = await this.findOneById(id, userId);
            return {
                statusCode: HttpStatus.OK,
                message: InventoryMessages.Update,
                data: result
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    // main
    async updateValue(id: number, updateValue: UpdateValue) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { value } = updateValue;
            const { id: userId } = this.req.user;
            const inventory = await this.findById(id);
            if (Number(value) > Number(inventory.max)) throw new BadRequestException('value cant be more than max capacity')
            if (inventory.status == false) throw new BadRequestException('inventory is deActive')
            const obj = RemoveNullProperty(updateValue)
            await this.inventoryRepository.update({ id: inventory.id }, obj)
            const result = await this.findById(id);
            return {
                statusCode: HttpStatus.OK,
                message: InventoryMessages.Update,
                data: result
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    // android
    async updateValueAndroid(id: number, updateValue: UpdateValue) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { value } = updateValue;
            const inventory = await this.findById(id);
            if (Number(value) > Number(inventory.max)) throw new BadRequestException('value cant be more than max capacity')
            if (inventory.status == false) throw new BadRequestException('inventory is deActive')
            const obj = RemoveNullProperty(updateValue)
            await this.inventoryRepository.update({ id: inventory.id }, obj)
            return {
                statusCode: HttpStatus.OK,
                message: InventoryMessages.Update
            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async remove(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id: userId } = this.req.user
            const inventory = await this.findById(id)
            await this.inventoryRepository.remove(inventory)
            return {
                statusCode: HttpStatus.OK,
                message: InventoryMessages.Remove

            }
        } catch (error) {
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async statusToggle(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
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
            console.log(`error -> ${this.req.url} -> `, error.message);
            throw error
        }
    }
    async statusToggleAndroid(id: number) {
        try {
            console.log(`access  -> ${this.req.url}`);
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
            console.log(`error -> ${this.req.url} -> `, error.message);
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
    findLatestDate(inventories: InventoryEntity[]) {
        return inventories
            .map(inventory => new Date(inventory.updated_at)) // Convert strings to Date objects
            .reduce((latest, current) => (current > latest ? current : latest));
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
        //if (inventory.length == 0) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async findAllUserInventories(ownerId: number) {
        const inventory = await this.inventoryRepository.find({
            where: {
                station: { ownerId }
            },
            relations: { station: { fuels: true } }
        });
        if (!inventory) throw new NotFoundException(InventoryMessages.NotFound)
        return inventory
    }
    async getSumValueForInventory(stationId: number, fuel_type) {
        const inventories = await this.findByStationIdAndFuel(stationId, fuel_type)
        const sumValue = inventories.reduce((sum, inventory) => sum + Number(inventory.value), 0);
        return sumValue
    }
    async getMaxInventoryCapacity(stationId: number, fuel_type) {
        const inventories = await this.findByStationIdAndFuel(stationId, fuel_type)
        const sumValue = inventories.reduce((sum, inventory) => sum + Number(inventory.max), 0);
        return sumValue
    }
    async getSomeDetailsOfInventory(station: StationEntity[], fuel_type: number) {
        let detailsList: Array<object> = []
        const promise = station.map(async station => {
            const inventories = await this.findByStationIdAndFuel(station.id, fuel_type)
            console.log(inventories.length);
            if (inventories.length == 0) return
            const capacity = inventories.reduce((sum, inventory) => sum + Number(inventory.max), 0);
            const value = inventories.reduce((sum, inventory) => sum + Number(inventory.value), 0);
            const latestDate = this.findLatestDate(inventories)
            detailsList.push({
                inventory_count: inventories.length,
                value,
                capacity,
                station_name: station.name,
                location: station.location.address,
                latestDate
            })
        })
        await Promise.all(promise)
        if(detailsList.length == 0) throw new BadRequestException('something went wrong')
        return detailsList
    }
    async getAvailableInventory(stationId: number, fuel_type: number) {
        const inventory = await this.inventoryRepository.findOne({
            relations: { fuels: true },
            where: {
                status: true,
                stationId,
                fuels: {
                    id: fuel_type
                }
            },
            select: {
                id: true,
                fuels: { name: true }
            }
        })
        return inventory
    }
}