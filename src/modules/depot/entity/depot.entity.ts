import * as moment from "jalali-moment";
import { EntityName } from "../../../common/enums/entity.enum";
import { LocationEntity } from "../../../modules/location/entity/location.entity";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { TankerEntity } from "../../../modules/tanker/entities/tanker.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { AfterSoftRemove, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @OneToOne(() => UserEntity, owner => owner.depot,{onDelete: 'CASCADE'})
    @JoinColumn({ name: 'ownerId' })
    owner: UserEntity;
    @AfterSoftRemove()
    afterSoftRemove() {
    console.log(`User with ID ${this.id} was soft-deleted.`);
    // Add any custom logic here, like logging or triggering an event.
    }
    @OneToOne(() => LocationEntity, location => location.depot, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'locationId' })
    location: LocationEntity
    @OneToMany(() => TankerEntity, tanker => tanker.depot)
    tankers: TankerEntity[]
    @OneToMany(() => RequestEntity, request => request.depot)
    requests: RequestEntity[]
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
}
