import { EntityName } from "src/common/enums/entity.enum"
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { PriorityEnum } from "../enums/priority.enum"
import { FuelTypes } from "src/common/enums/fuelType.enum"
import { StatusEnum } from "src/common/enums/status.enum"
import { ReceiveTimeEnum } from "../enums/time.enum"
import { DepotEntity } from "src/modules/depot/entity/depot.entity"
import { CargoEntity } from "src/modules/cargo/entities/cargo.entity"
import { StationEntity } from "src/modules/station/entity/station.entity"

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
    @Column({ enum: FuelTypes })
    fuel_type: FuelTypes;
    @Column({ enum: StatusEnum,default: StatusEnum.Posted })
    status: StatusEnum;
    @Column({ enum: ReceiveTimeEnum})
    receive_at: ReceiveTimeEnum;
    @CreateDateColumn()
    created_at: Date
    @OneToMany(() => DepotEntity, depot => depot.requests,{onDelete: "CASCADE"})
    depot: DepotEntity;
    @ManyToOne(() => StationEntity, station => station.requests,{onDelete: "CASCADE"})
    station: StationEntity;
    @OneToOne(() => CargoEntity, cargo => cargo.request)
    cargo: CargoEntity
}
