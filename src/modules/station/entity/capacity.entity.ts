import { EntityName } from "src/common/enums/entity.enum";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";

@Entity(EntityName.Capacity)
export class CapacityEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'bigint' })
    value: number;
    @Column({ enum: FuelTypes })
    fuel_type: FuelTypes;
    @Column()
    stationId: number
    @Column({ default: true})
    status: boolean
    @UpdateDateColumn()
    updated_at: Date
    @ManyToOne(() => StationEntity, station => station.max_capacity)
    station: StationEntity
}