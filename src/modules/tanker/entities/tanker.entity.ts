import { EntityName } from "../../../common/enums/entity.enum";
import { CargoEntity } from "../../../modules/cargo/entities/cargo.entity";
import { DepotEntity } from "../../../modules/depot/entity/depot.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlateEntity } from "./plate.entity";

@Entity(EntityName.Tanker,{ orderBy: { id: "DESC" } })
export class TankerEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    driverId: number;
    @Column({ type: 'bigint' })
    capacity: number;
    @Column({ unique: true })
    number: number;
    @Column({default: true})
    available: boolean;
    @Column({nullable: true })
    plateId: number;
    @Column()
    depotId: number;
    @OneToOne(() => UserEntity, user => user.tanker, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driverId' })
    driver: UserEntity;
    @ManyToOne(() => DepotEntity, depot => depot.tankers, { onDelete: "CASCADE" })
    depot: DepotEntity
    @ManyToMany(() => CargoEntity, cargo => cargo.tankers, { onDelete: "CASCADE" })
    cargo: CargoEntity
    @OneToOne(() => PlateEntity,plate => plate.tanker)
    @JoinColumn({name: "plateId"})
    plate: PlateEntity
}
