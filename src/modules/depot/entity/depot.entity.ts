import { DateToJalali } from "src/common/utils/convert-time.utils";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";
import { LocationEntity } from "../../../modules/location/entity/location.entity";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { TankerEntity } from "../../../modules/tanker/entities/tanker.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";

@Entity(EntityName.Depot, { orderBy: { id: "DESC" } })
export class DepotEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    ownerId: number;
    @Column()
    locationId: number;
    @OneToOne(() => UserEntity, owner => owner.depot)
    @JoinColumn({ name: 'ownerId' })
    owner: UserEntity;
<<<<<<< HEAD
=======
    @AfterSoftRemove()
    afterSoftRemove() {
    console.log(`User with ID ${this.id} was soft-deleted.`);
    // Add any custom logic here, like logging or triggering an event.
    }
>>>>>>> 4f3fb687ed5fdd28a27e40db91456b3897ed5aaf
    @OneToOne(() => LocationEntity, location => location.depot, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'locationId' })
    location: LocationEntity
    @OneToMany(() => TankerEntity, tanker => tanker.depot)
    tankers: TankerEntity[]
    @OneToMany(() => RequestEntity, request => request.depot)
    requests: RequestEntity[]
    @CreateDateColumn({
        type: 'timestamp',
        transformer: DateToJalali
    })
    created_at: Date
}
