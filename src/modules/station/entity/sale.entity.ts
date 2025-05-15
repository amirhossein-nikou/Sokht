import { EntityName } from "../../../common/enums/entity.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity";
@Entity(EntityName.AvgSale,{ orderBy: { id: "DESC" } })
export class AverageSaleEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    average_sale: number;
    @Column()
    fuel_type: number;
    @Column({ nullable: true })
    stationId: number
    @ManyToOne(() => StationEntity, station => station.average_sale, { onDelete: "CASCADE" })
    station: StationEntity;
    @ManyToOne(() => FuelTypeEntity, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: 'fuel_type' })
    fuels: FuelTypeEntity
    @UpdateDateColumn()
    updated_at: Date
}
