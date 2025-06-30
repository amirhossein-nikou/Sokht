import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CargoService } from "../cargo/cargo.service";
import { InventoryService } from "../station/services/inventory.service";
import { NotificationGateway } from "../notification/notification.gateway";
import { CreateNumber } from "src/common/utils/create-number.utils";


@Injectable({ scope: Scope.REQUEST })
export class HomeService {
    constructor(
        private inventoryService: InventoryService,
        private cargoService: CargoService,
        private notification: NotificationGateway,
        @Inject(REQUEST) private req: Request
    ) { }
    async dashboard() {
        const { id, parentId } = this.req.user
        const inventory = await this.inventoryService.findAllUserInventories(parentId ?? id)
        const cargo = await this.cargoService.findCargoWithDetails(parentId ?? id)
        return {
            statusCode: HttpStatus.OK,
            data: {
                inventory,
                cargo
            }
        }
    }
}