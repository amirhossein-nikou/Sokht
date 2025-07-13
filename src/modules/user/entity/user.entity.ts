import { EntityName } from "../../../common/enums/entity.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../enum/role.enum";
import { OtpEntity } from "../../../modules/auth/entity/otp.entity";
import { StationEntity } from "../../../modules/station/entity/station.entity";
import { DepotEntity } from "../../../modules/depot/entity/depot.entity";
import { TankerEntity } from "../../../modules/tanker/entities/tanker.entity";
import { TicketEntity } from "../../../modules/ticket/entities/ticket.entity";

@Entity(EntityName.User, { orderBy: { id: "DESC" } })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    first_name: string
    @Column()
    last_name: string
    @Column({ nullable: true })
    position: string
    @Column({ unique: true })
    mobile: string
    @Column({ unique: true })
    national_code: string
    @Column({ enum: UserRole })
    role: UserRole
    @Column({ nullable: true, unique: true })
    certificateId: string
    @Column({ default: false })
    verify_mobile: boolean
    @Column({ nullable: true })
    parentId: number
    @Column({ nullable: true })
    otpId: number
    @Column({ nullable: true })
    newMobile: string
    @ManyToOne(() => UserEntity, user => user.child, { onDelete: 'CASCADE' })
    parent: UserEntity
    @OneToMany(() => UserEntity, user => user.parent)
    child: UserEntity[]
    @OneToOne(() => OtpEntity, otp => otp.user)
    @JoinColumn({ name: 'otpId' })
    otp: OtpEntity;
    @OneToMany(() => StationEntity, station => station.owner, { onDelete: "CASCADE" })
    stations: StationEntity[];
    @OneToMany(() => TicketEntity, ticket => ticket.user, { onDelete: "CASCADE" })
    tickets: TicketEntity[];
    @OneToOne(() => DepotEntity, depot => depot.owner)
    depot: DepotEntity;
    @OneToOne(() => TankerEntity, tanker => tanker.driver, { onDelete: "CASCADE" })
    tanker: TankerEntity;
}
