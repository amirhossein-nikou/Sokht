import { BelongsTo, Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { OtpModel } from "src/modules/auth/model/otp.model";
import { UserRole } from "../enum/role.enum";
import { StationModel } from "src/modules/station/models/station.model";

@Table({ tableName: 'user' })
export class UserModel extends Model<UserModel> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number
    @Column({ type: DataType.STRING, allowNull: false })
    first_name: string
    @Column({ type: DataType.STRING, allowNull: false })
    last_name: string
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    mobile: string
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    national_code: string
    @Column({
        type: DataType.ENUM,
        values: [UserRole.OilDepotUser, UserRole.StationUser, UserRole.headUser],
        allowNull: true
    })
    role: UserRole
    @Column({ type: DataType.BIGINT, allowNull: true, unique: true })
    certificateId: number
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    verify_mobile: boolean
    @Column({ type: DataType.INTEGER, allowNull: true })
    parentId: number
    @Column({ type: DataType.INTEGER, allowNull: true })
    otpId: number
    @BelongsTo(() => UserModel, { onDelete: 'CASCADE', foreignKey: 'parentId' })
    parent: UserModel
    @HasMany(() => UserModel, 'parentId')
    child: UserModel
    @HasOne(() => OtpModel, 'userId')
    otp: OtpModel
    @HasOne(() => StationModel,'ownerId')
    station: StationModel;
}
