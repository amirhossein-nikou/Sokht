import { EntityName } from "src/common/enums/entity.enum";
import { LocationEntity } from "src/modules/location/entity/location.entity";
import { RequestEntity } from "src/modules/request/entities/request.entity";
import { TankerEntity } from "src/modules/tanker/entities/tanker.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @OneToOne(() => LocationEntity, location => location.depot, {onDelete: "CASCADE",eager: true})
    @JoinColumn({name: 'locationId'})
    location: LocationEntity
    @OneToMany(() => TankerEntity, tanker => tanker.depot)
    tankers: TankerEntity[]
    @OneToMany(() => RequestEntity, request => request.depot)
    requests: RequestEntity[]
}
