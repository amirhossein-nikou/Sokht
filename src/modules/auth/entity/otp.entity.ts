import { EntityName } from "../../../common/enums/entity.enum";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity(EntityName.Otp)
export class OtpEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    expires_in: Date;
    @Column()
    code: string;
    @Column()
    userId: number;
    @OneToOne(() => UserEntity, user => user.otp, {onDelete: "CASCADE"})
    @JoinColumn({name: 'userId'})
    user: UserEntity
}