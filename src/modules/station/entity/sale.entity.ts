import { DateToJalali, jalaliDate } from "src/common/utils/convert-time.utils";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity";
import { StationEntity } from "./station.entity";
import { Expose } from "class-transformer";
@Entity(EntityName.AvgSale, { orderBy: { id: "DESC" } })
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
    @Expose()
    get jalali_updated_at(): string {
        return jalaliDate(this.updated_at)
    }
}
