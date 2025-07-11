import { EntityName } from "src/common/enums/entity.enum";
import { DateToJalali, jalaliDate } from "src/common/utils/convert-time.utils";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";
import { Expose } from "class-transformer";
@Entity(EntityName.Limit, { orderBy: { id: "DESC" } })
export class LimitEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    value: number;
    @Column()
    stationId: number
    @Column({ type: 'timestamp' })
    date: Date;
    @Column({ type: 'boolean', default: false })
    by_user: boolean
    @UpdateDateColumn()
    updated_at: Date
    @Expose({})
    get jalali_updated_at(): string {
        return jalaliDate(this.updated_at)
    }
    @Expose({})
    get jalali_date(): string {
        return jalaliDate(this.date)
    }
    @OneToOne(() => StationEntity, station => station.limit, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stationId' })
    station: StationEntity

}