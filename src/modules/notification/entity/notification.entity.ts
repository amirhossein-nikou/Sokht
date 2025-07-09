import { EntityName } from "src/common/enums/entity.enum";
import { DateToJalali } from "src/common/utils/convert-time.utils";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity(EntityName.Notification, { orderBy: { id: "DESC" } })
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    title: string
    @Column()
    description: string
    @Column()
    userId: number
    @Column({nullable: true})
    parentId: number
    @CreateDateColumn({
        transformer: DateToJalali
    })
    created_at: Date
}
