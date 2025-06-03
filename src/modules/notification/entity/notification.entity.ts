import * as moment from "jalali-moment";
import { EntityName } from "src/common/enums/entity.enum";
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
