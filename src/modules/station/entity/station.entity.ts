import { EntityName } from "../../../common/enums/entity.enum";
import { FuelTypeEntity } from "../../../modules/fuel-type/entities/fuel-type.entity";
import { LocationEntity } from "../../../modules/location/entity/location.entity";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InventoryEntity } from "./inventory.entity";
import { AverageSaleEntity } from "./sale.entity";
import * as moment from "jalali-moment";

@Entity(EntityName.Station,{ orderBy: { id: "DESC" } })
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
    @CreateDateColumn({
            transformer: {
                to(value) { return value },
                from(value) {
                    if (value) {
                        return moment(value).locale('fa').format('jYYYY-jMM-jDD HH:mm:ss')
                    }
                }
            }
        })
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
    @ManyToMany(() => FuelTypeEntity,{onDelete: 'CASCADE'})
    @JoinTable()
    fuels: FuelTypeEntity[]
}
