import { Expose } from "class-transformer";
import { EntityName } from "src/common/enums/entity.enum";
import { DateToJalali, jalaliDate } from "src/common/utils/convert-time.utils";
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
    @Column({ nullable: true })
    parentId: number
    @CreateDateColumn()
    created_at: Date
    @Expose()
    get jalali_created_at(): string {
        return jalaliDate(this.created_at)
    }
}
