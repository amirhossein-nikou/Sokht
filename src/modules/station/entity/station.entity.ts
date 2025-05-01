import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InventoryEntity } from "./inventory.entity";
import { AverageSaleEntity } from "./sale.entity";
import { LocationEntity } from "src/modules/location/entity/location.entity";
import { RequestEntity } from "src/modules/request/entities/request.entity";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { FuelTypeEntity } from "src/modules/fuel-type/entities/fuel-type.entity";

@Entity(EntityName.Station)
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
    // relations
    @ManyToOne(() => UserEntity, user => user.stations)
    owner: UserEntity;
    @OneToOne(() => LocationEntity, location => location.station)
    @JoinColumn({ name: "locationId" })
    location: LocationEntity
    @OneToMany(() => AverageSaleEntity, sale => sale.station)
    average_sale: AverageSaleEntity[]
    @OneToMany(() => InventoryEntity, inventory => inventory.station)
    inventory: InventoryEntity[]
    @OneToMany(() => RequestEntity, request => request.station)
    requests: RequestEntity[]
    @ManyToMany(() => FuelTypeEntity,{onDelete: 'CASCADE',eager: true})
    @JoinTable()
    fuels: FuelTypeEntity[]
}
