import { Expose } from "class-transformer";
import { jalaliDate } from "src/common/utils/convert-time.utils";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity";
import { LocationEntity } from "../../../modules/location/entity/location.entity";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { InventoryEntity } from "./inventory.entity";
import { LimitEntity } from "./limit.entity";
import { AverageSaleEntity } from "./sale.entity";

@Entity(EntityName.Station, { orderBy: { id: "DESC" } })
export class StationEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column({ default: false })
    isActive: boolean;
    @Column({ nullable: true })
    ownerId: number;
    @Column({ nullable: true })
    locationId: number;
    // @Column({type: 'int' ,array: true})
    // fuel_types: number[]
    @CreateDateColumn()
    created_at: Date
    @Expose()
    get jalali_created_at(): string {
        return jalaliDate(this.created_at)
    }
    // relations
    @ManyToOne(() => UserEntity, user => user.stations, { onDelete: 'CASCADE' })
    owner: UserEntity;
    @OneToOne(() => LocationEntity, location => location.station, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "locationId" })
    location: LocationEntity
    @OneToMany(() => AverageSaleEntity, sale => sale.station, { onDelete: 'CASCADE' })
    average_sale: AverageSaleEntity[]
    @OneToMany(() => InventoryEntity, inventory => inventory.station, { onDelete: 'CASCADE' })
    inventory: InventoryEntity[]
    @OneToMany(() => RequestEntity, request => request.station, { onDelete: 'CASCADE' })
    requests: RequestEntity[]
    @ManyToMany(() => FuelTypeEntity, { onDelete: 'CASCADE' })
    @JoinTable()
    fuels: FuelTypeEntity[]
    @OneToOne(() => LimitEntity, limit => limit.station, { eager: true, onDelete: 'CASCADE' })
    limit: LimitEntity
}
