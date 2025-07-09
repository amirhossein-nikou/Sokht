import { EntityName } from "../../../common/enums/entity.enum";
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";
import { DateToJalali } from "src/common/utils/convert-time.utils";

@Entity(EntityName.Inventory, { orderBy: { id: "DESC" } })
export class InventoryEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column({ type: 'bigint', default: 0 })
    value: number;
    @Column({ type: 'bigint' })
    max: number;
    @Column({ nullable: true })
    fuel_type: number;
    @Column({ default: true })
    status: boolean
    @Column()
    stationId: number
    @ManyToOne(() => StationEntity, station => station.inventory, { onDelete: "CASCADE" })
    station: StationEntity
    @ManyToOne(() => FuelTypeEntity, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: 'fuel_type' })
    fuels: FuelTypeEntity
    @UpdateDateColumn({
        transformer: DateToJalali
    })
    updated_at: Date
}