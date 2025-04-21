import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InventoryEntity } from "./inventory.entity";
import { AverageSaleEntity } from "./sale.entity";
import { LocationEntity } from "src/modules/location/entity/location.entity";
import { CapacityEntity } from "./capacity.entity";
import { RequestEntity } from "src/modules/request/entities/request.entity";

@Entity(EntityName.Station)
export class StationEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column({default: false})
    isActive: boolean;
    @Column({ nullable: true })
    ownerId: number;
    @Column({nullable: true})
    locationId: number;
    @CreateDateColumn()
    created_at: Date
    // relations
    @ManyToOne(() => UserEntity, user => user.stations)
    owner: UserEntity;
    @OneToOne(() => LocationEntity, location => location.station)
    @JoinColumn({name:"locationId"})
    location: LocationEntity
    @OneToMany(() => AverageSaleEntity, sale => sale.station)
    average_sale: AverageSaleEntity[]
    @OneToMany(() => InventoryEntity, inventory => inventory.station)
    inventory: InventoryEntity[]
    @OneToMany(() => CapacityEntity, capacity => capacity.station)
    max_capacity: CapacityEntity[]
    @OneToMany(() => RequestEntity, request => request.station)
    requests: RequestEntity[]
}
