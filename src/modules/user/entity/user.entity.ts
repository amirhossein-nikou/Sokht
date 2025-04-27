import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../enum/role.enum";
import { OtpEntity } from "src/modules/auth/entity/otp.entity";
import { StationEntity } from "src/modules/station/entity/station.entity";
import { DepotEntity } from "src/modules/depot/entity/depot.entity";
import { TankerEntity } from "src/modules/tanker/entities/tanker.entity";
import { TicketEntity } from "src/modules/ticket/entities/ticket.entity";

@Entity(EntityName.User)
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    first_name: string
    @Column()
    last_name: string
    @Column({ unique: true })
    mobile: string
    @Column({ unique: true })
    national_code: string
    @Column({enum: UserRole})
    role: UserRole
    @Column({ nullable: true, unique: true })
    certificateId: number
    @Column({ default: false })
    verify_mobile: boolean
    @Column({ nullable: true })
    parentId: number
    @Column({ nullable: true })
    otpId: number
    @ManyToOne(() => UserEntity, user => user.child, { onDelete: 'CASCADE' })
    parent: UserEntity
    @OneToMany(() => UserEntity, user => user.parent)
    child: UserEntity[]
    @OneToOne(() => OtpEntity, otp => otp.user)
    @JoinColumn({name: 'otpId'})
    otp: OtpEntity;
    @OneToMany(() => StationEntity, station => station.owner)
    stations: StationEntity[];
    @OneToMany(() => TicketEntity, ticket => ticket.user)
    tickets: TicketEntity[];
    @OneToOne(() => DepotEntity, depot => depot.owner)
    depot: DepotEntity;
    @OneToOne(() => TankerEntity, tanker => tanker.driver)
    tanker: TankerEntity;
}
