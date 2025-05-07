import { EntityName } from "src/common/enums/entity.enum";
import { RequestEntity } from "src/modules/request/entities/request.entity";
import { TankerEntity } from "src/modules/tanker/entities/tanker.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Cargo)
export class CargoEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column({unique: true})
    requestId: number;
    @Column({type: 'int' ,array: true,nullable: true})
    tankerId: number[];
    @Column()
    dispatch_time: Date;
    @Column()
    arrival_time: Date;
    @Column({default: true})
    inProgress: boolean
    @ManyToMany(() => TankerEntity, tanker => tanker.cargo,{eager: true})
    @JoinTable()
    tankers: TankerEntity[];
    @OneToOne(() => RequestEntity, request => request.cargo, { onDelete: "CASCADE" })
    @JoinColumn({name: "requestId"})
    request: RequestEntity
    @CreateDateColumn()
    created_at: Date
}
