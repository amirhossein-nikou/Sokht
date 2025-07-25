import { DateToJalali, jalaliDate } from "src/common/utils/convert-time.utils";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";
import { LocationEntity } from "../../../modules/location/entity/location.entity";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { TankerEntity } from "../../../modules/tanker/entities/tanker.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { Expose } from "class-transformer";

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
    @OneToOne(() => LocationEntity, location => location.depot, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'locationId' })
    location: LocationEntity
    @OneToMany(() => TankerEntity, tanker => tanker.depot)
    tankers: TankerEntity[]
    @OneToMany(() => RequestEntity, request => request.depot)
    requests: RequestEntity[]
    @CreateDateColumn()
    created_at: Date
    @Expose()
    get jalali_created_at(): string {
        return jalaliDate(this.created_at)
    }
}
