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
    async dashboard(dashboardDto: DashboardDto) {
        const { inventoryId, cargoId } = dashboardDto
        const { id } = this.req.user
        const inventory = await this.inventoryService.findOneById(inventoryId, id)
        const cargo = await this.cargoService.findCargoWithDetails(cargoId)
        return {
            statusCode: HttpStatus.OK,
            data: {
                inventory,
                cargo
            } 
        }
    }

}