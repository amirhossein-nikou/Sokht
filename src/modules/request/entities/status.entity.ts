import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity(EntityName.Status)
export class StatusEntity {
    @PrimaryColumn()
    id: number
    @Column()
    status: string
}
