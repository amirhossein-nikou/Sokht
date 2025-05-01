import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.FuelType)
export class FuelTypeEntity {
    @PrimaryGeneratedColumn('increment')
    id: number
    @Column()
    name: string
}
