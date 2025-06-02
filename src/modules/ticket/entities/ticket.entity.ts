import { EntityName } from "../../../common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TicketTargetEnum } from "../enum/target.enum";
import { TicketPriorityEnum } from "../enum/ticket-priority.enum";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import * as moment from 'jalali-moment'

@Entity(EntityName.Ticket, { orderBy: { id: "DESC" } })
export class TicketEntity {
    @PrimaryGeneratedColumn("increment")
    id: number
    @Column()
    title: string;
    @Column({ nullable: true })
    file: string;
    @Column()
    content: string;
    @Column({ enum: TicketTargetEnum })
    target: TicketTargetEnum
    @Column({ enum: TicketPriorityEnum })
    priority: TicketPriorityEnum
    @Column()
    userId: number
    @Column({ default: false })
    status: boolean
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
    // relations 
    @ManyToOne(() => UserEntity, user => user.tickets, { onDelete: "CASCADE" })
    user: UserEntity
}
