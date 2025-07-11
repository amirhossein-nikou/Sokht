import { Expose } from "class-transformer";
import { jalaliDate } from "src/common/utils/convert-time.utils";
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { EntityName } from "../../../common/enums/entity.enum";

@Entity(EntityName.FuelType, { orderBy: { id: "DESC" } })
export class FuelTypeEntity {
    @PrimaryColumn()
    id: number
    @Column()
    name: string
    @Column({ type: 'int', array: true, nullable: true })
    available_value: number[]
    @Column({ nullable: true })
    limit: number
    @UpdateDateColumn()
    updated_at: Date
    @Expose()
    get jalali_created_at(): string {
        return jalaliDate(this.updated_at)
    }
}
