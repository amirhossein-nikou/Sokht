import { EntityName } from "src/common/enums/entity.enum";
import { DateToJalali } from "src/common/utils/convert-time.utils";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StationEntity } from "./station.entity";
@Entity(EntityName.Limit, { orderBy: { id: "DESC" } })
export class LimitEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    value: number;
    @Column()
    stationId: number
    @Column({type: 'timestamp'})
    date: Date;
    @UpdateDateColumn({transformer: DateToJalali})
    updated_at: Date
    @OneToOne(() => StationEntity, station => station.limit,{onDelete: 'CASCADE'})
    @JoinColumn({name:'stationId'})
    station: StationEntity
}