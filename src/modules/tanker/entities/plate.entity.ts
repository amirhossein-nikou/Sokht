import { EntityName } from "src/common/enums/entity.enum";
import { AfterInsert, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TankerEntity } from "./tanker.entity";
import { plateFormat } from "src/common/utils/plate-format.utils";

@Entity(EntityName.Plate)
export class PlateEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    first: number
    @Column()
    second: number
    @Column()
    city: number
    @Column()
    char: string
    @Column()
    full_plate: string
    @OneToOne(() => TankerEntity, tanker => tanker.plate, { onDelete: "CASCADE" })
    tanker: TankerEntity
}