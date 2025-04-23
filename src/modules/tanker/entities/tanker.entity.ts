import { EntityName } from "src/common/enums/entity.enum";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { CargoEntity } from "src/modules/cargo/entities/cargo.entity";
import { DepotEntity } from "src/modules/depot/entity/depot.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Tanker)
export class TankerEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    driverId: number;
    @Column({type: 'bigint'})
    capacity: number;
    @Column({enum: FuelTypes})
    fuel_type: FuelTypes;
    @Column({unique: true})
    number: number;
    @Column()
    depotId: number;
    @Column({nullable: true})
    cargoId: number;
    @OneToOne(() => UserEntity, user => user.tanker, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'driverId'})
    driver: UserEntity;
    @ManyToOne(() => DepotEntity, depot =>depot.tankers, {onDelete: "CASCADE"})
    depot: DepotEntity
    @ManyToOne(() => CargoEntity, cargo =>cargo.tankers, {onDelete: "CASCADE"})
    cargo: CargoEntity
    
}
