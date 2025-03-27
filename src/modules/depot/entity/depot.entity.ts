import { EntityName } from "src/common/enums/entity.enum";
import { LocationEntity } from "src/modules/location/entity/location.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Depot)
export class DepotEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    ownerId: number;
    @Column()
    locationId: number;
    @OneToOne(() => UserEntity,owner => owner.depot)
    @JoinColumn({name: 'ownerId'})
    owner: UserEntity;
    @OneToOne(() => LocationEntity, location => location.depot, {onDelete: "CASCADE"})
    @JoinColumn({name: 'locationId'})
    location: LocationEntity
    //tankers []
}
