import { EntityName } from "../../../common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TicketTargetEnum } from "../enum/target.enum";
import { TicketPriorityEnum } from "../enum/ticket-priority.enum";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { DateToJalali, jalaliDate } from "src/common/utils/convert-time.utils";
import { Expose } from "class-transformer";

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
    @CreateDateColumn()
    created_at: Date
    @Expose()
    get jalali_created_at(): string {
        return jalaliDate(this.created_at)
    }
    // relations 
    @ManyToOne(() => UserEntity, user => user.tickets, { onDelete: "CASCADE" })
    user: UserEntity
}
