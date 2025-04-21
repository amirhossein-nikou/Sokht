import { EntityName } from "src/common/enums/entity.enum";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";

@Entity(EntityName.Inventory)
export class InventoryEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: 'bigint'})
    value: number;
    @Column({type: 'bigint'})
    max: number;
    @Column({enum: FuelTypes})
    fuel_type: FuelTypes;
    @Column({ default: true})
    status: boolean
    @Column()
    stationId: number
    @ManyToOne(() => StationEntity, station => station.inventory,{onDelete: "CASCADE"})
    station: StationEntity
    @UpdateDateColumn()
    updated_at: Date
}