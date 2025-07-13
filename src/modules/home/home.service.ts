import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CargoService } from "../cargo/cargo.service";
import { InventoryService } from "../station/services/inventory.service";
import { StationService } from "../station/services/station.service";
import { DepotService } from "../depot/depot.service";
import { RequestService } from "../request/request.service";
import { UserRole } from "../user/enum/role.enum";


@Injectable({ scope: Scope.REQUEST })
export class HomeService {
    constructor(
        private inventoryService: InventoryService,
        private cargoService: CargoService,
        private requestService: RequestService,
        private depotService: DepotService,
        private stationService: StationService,
        @Inject(REQUEST) private req: Request
    ) { }
    async dashboard() {
        try {
            console.log(`access  -> ${this.req.url}`);
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
        } catch (error) {
            console.error(error.message);
        }
    }
    async headDashboard() {
        try {
            console.log(`access  -> ${this.req.url}`);
            const { id, parentId, role } = this.req.user
            let activeRequests: number = await this.requestService.getActiveRequests()
            let receivedFuel: number = await this.requestService.getReceivedFuelsValue()
            const stations = await this.stationService.getAllStations()
            let depots: number = (await this.depotService.getAllDepots()).length
            if (role == UserRole.OilDepotUser) {
                activeRequests = await this.requestService.getActiveRequests(id ?? parentId)
                receivedFuel = await this.requestService.getReceivedFuelsValue(id ?? parentId)
                depots = 1
            }
            return {
                activeRequests,
                receivedFuel,
                stations: stations.length,
                depots
            }
        } catch (error) {
            console.error(error.message);
        }
    }
}