import { EntityName } from "src/common/enums/entity.enum";
import { RequestEntity } from "src/modules/request/entities/request.entity";
import { TankerEntity } from "src/modules/tanker/entities/tanker.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Cargo)
export class CargoEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column({unique: true})
    requestId: number;
    @Column()
    dispatch_time: Date;
    @Column()
    arrival_time: Date;
    @OneToMany(() => TankerEntity, tanker => tanker.cargo)
    tankers: TankerEntity[];
    @OneToOne(() => RequestEntity, request => request.cargo, { onDelete: "CASCADE" })
    @JoinColumn({name: "requestId"})
    request: RequestEntity
}
