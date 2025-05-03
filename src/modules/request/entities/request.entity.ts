import { EntityName } from "src/common/enums/entity.enum"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { PriorityEnum } from "../enums/priority.enum"
import { StatusEnum } from "src/common/enums/status.enum"
import { ReceiveTimeEnum } from "../enums/time.enum"
import { DepotEntity } from "src/modules/depot/entity/depot.entity"
import { CargoEntity } from "src/modules/cargo/entities/cargo.entity"
import { StationEntity } from "src/modules/station/entity/station.entity"
import { StatusEntity } from "./status.entity"

@Entity(EntityName.Request)
export class RequestEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    stationId: number;
    @Column({ enum: PriorityEnum })
    priority: PriorityEnum;
    @Column({ type: 'bigint' })
    value: number;
    @Column()
    depotId: number;
    @Column()
    fuel_type: number;
    @Column({ enum: StatusEnum, default: StatusEnum.Posted })
    statusId: StatusEnum;
    @Column({ enum: ReceiveTimeEnum })
    receive_at: ReceiveTimeEnum;
    @CreateDateColumn()
    created_at: Date
    @ManyToOne(() => DepotEntity, depot => depot.requests, { onDelete: "CASCADE"})
    depot: DepotEntity;
    @ManyToOne(() => StationEntity, station => station.requests, { onDelete: "CASCADE" })
    station: StationEntity;
    @ManyToOne(() => StatusEntity,{eager: true})
    @JoinColumn({name:'statusId'})
    status: StatusEntity;
    @OneToOne(() => CargoEntity, cargo => cargo.request)
    cargo: CargoEntity
}
