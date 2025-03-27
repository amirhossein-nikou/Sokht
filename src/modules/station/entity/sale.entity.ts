import { EntityName } from "src/common/enums/entity.enum";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StationEntity } from "./station.entity";
@Entity(EntityName.AvgSale)
export class AverageSaleEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    monthly_average_sale: number;
    @Column({ enum: FuelTypes })
    fuel_type: FuelTypes;
    @Column({ nullable: true })
    stationId: number
    @ManyToOne(() => StationEntity, station => station.average_sales)
    station: StationEntity;
}
