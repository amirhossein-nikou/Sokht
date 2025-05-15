import { EntityName } from "../../../common/enums/entity.enum"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { PriorityEnum } from "../enums/priority.enum"
import { StatusEnum } from "../../../common/enums/status.enum"
import { ReceiveTimeEnum } from "../enums/time.enum"
import { DepotEntity } from "../../../modules/depot/entity/depot.entity"
import { CargoEntity } from "../../../modules/cargo/entities/cargo.entity"
import { StationEntity } from "../../../modules/station/entity/station.entity"
import { StatusEntity } from "./status.entity"
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity"
import { RejectDetails } from "src/common/types/reject-details.type"

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
    @Column({ nullable: true, type: 'numeric' })
    priority_value: number
    @ManyToOne(() => DepotEntity, depot => depot.requests, { onDelete: "CASCADE" })
    depot: DepotEntity;
    @ManyToOne(() => FuelTypeEntity, { eager: true })
    @JoinColumn({ name: 'fuel_type' })
    fuel: FuelTypeEntity;
    @ManyToOne(() => StationEntity, station => station.requests, { onDelete: "CASCADE" })
    station: StationEntity;
    @ManyToOne(() => StatusEntity, { eager: true })
    @JoinColumn({ name: 'statusId' })
    status: StatusEntity;
    @OneToOne(() => CargoEntity, cargo => cargo.request)
    cargo: CargoEntity
    @Column({nullable: true,type:'json'})
    rejectDetails: RejectDetails
}
