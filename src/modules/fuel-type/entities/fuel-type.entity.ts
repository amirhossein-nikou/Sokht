import { EntityName } from "../../../common/enums/entity.enum";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity(EntityName.FuelType, { orderBy: { id: "DESC" } })
export class FuelTypeEntity {
    @PrimaryColumn()
    id: number
    @Column()
    name: string
    @Column({ type: 'int', array: true, nullable: true })
    available_value: number[]
    @Column({nullable: true})
    limit: number
    @UpdateDateColumn()
    updated_at: Date
}
