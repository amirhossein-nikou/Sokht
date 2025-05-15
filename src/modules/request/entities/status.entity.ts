import { EntityName } from "../../../common/enums/entity.enum";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity(EntityName.Status,{ orderBy: { id: "DESC" } })
export class StatusEntity {
    @PrimaryColumn()
    id: number
    @Column()
    status: string
}
