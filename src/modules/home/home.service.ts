import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { Request } from "express";
import { InventoryService } from "../station/services/inventory.service";
import { CargoService } from "../cargo/cargo.service";
import { DashboardDto } from "./dto/dashboard.dto";
import { REQUEST } from "@nestjs/core";


@Injectable({ scope: Scope.REQUEST })
export class HomeService {
    constructor(
        private inventoryService: InventoryService,
        private cargoService: CargoService,
        @Inject(REQUEST) private req: Request

    ) { }
    async dashboard() {
        const { id } = this.req.user
        const inventory = await this.inventoryService.findAllUserInventories(id)
        const cargo = await this.cargoService.findCargoWithDetails()
        return {
            statusCode: HttpStatus.OK,
            data: {
                inventory,
                cargo
            } 
        }
    }

}