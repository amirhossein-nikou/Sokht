import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InventoryEntity } from "./inventory.entity";
import { AverageSaleEntity } from "./sale.entity";
import { LocationEntity } from "src/modules/location/entity/location.entity";

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
    @ManyToOne(() => UserEntity, user => user.stations)
    owner: UserEntity;
    @OneToOne(() => LocationEntity, location => location.station)
    @JoinColumn({name:"locationId"})
    location: LocationEntity
    @OneToMany(() => AverageSaleEntity, sale => sale.station)
    average_sales: AverageSaleEntity[]
    @ManyToOne(() => InventoryEntity, inventory => inventory.station)
    inventories: InventoryEntity[]
}
