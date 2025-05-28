import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";
import { RequestEntity } from "../../../modules/request/entities/request.entity";
import { TankerEntity } from "../../../modules/tanker/entities/tanker.entity";
import { RejectDetails } from "src/common/types/reject-details.type";
import * as moment from "jalali-moment";

@Entity(EntityName.Cargo, { orderBy: { id: "DESC" } })
export class CargoEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column({ unique: true })
    requestId: number;
    @Column({ type: 'int', array: true, nullable: true })
    tankerId: number[];
    @Column({ nullable: true })
    rejectId: number;
    @Column({ default: true })
    inProgress: boolean
    @ManyToMany(() => TankerEntity, tanker => tanker.cargo, { eager: true })
    @JoinTable()
    tankers: TankerEntity[];
    @OneToOne(() => RequestEntity, request => request.cargo, { onDelete: "CASCADE" })
    @JoinColumn({ name: "requestId" })
    request: RequestEntity
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
    @Column({ nullable: true, type: 'json' })
    rejectDetails: RejectDetails
}
