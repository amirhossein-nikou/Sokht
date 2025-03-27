import { EntityName } from "src/common/enums/entity.enum";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StationEntity } from "./station.entity";

@Entity(EntityName.Inventory)
export class InventoryEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: 'bigint'})
    value: number;
    @Column({enum: FuelTypes})
    fuel_type: FuelTypes;
    @Column()
    stationId: number
    @ManyToOne(() => StationEntity, station => station.inventories)
    station: StationEntity
}