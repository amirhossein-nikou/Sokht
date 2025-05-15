import { EntityName } from "../../../common/enums/entity.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.FuelType,{ orderBy: { id: "DESC" } })
export class FuelTypeEntity {
    @PrimaryGeneratedColumn('increment')
    id: number
    @Column()
    name: string
}
