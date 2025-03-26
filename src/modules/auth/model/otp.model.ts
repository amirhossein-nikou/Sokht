import { BelongsTo, Column,DataType, Model, Table } from "sequelize-typescript";
import { UserModel } from "src/modules/user/models/user.model";

@Table({tableName: 'otp',createdAt: false, updatedAt: false})
export class OtpModel extends Model<OtpModel>{
    @Column({type:DataType.INTEGER ,autoIncrement: true, primaryKey: true})
    id: number;
    @Column({type: DataType.DATE, allowNull: false})
    expires_in: Date;
    @Column({type: DataType.STRING, allowNull: false})
    code: string;
    @Column({type: DataType.INTEGER, allowNull: false})
    userId: number;
    @BelongsTo(() => UserModel, 'userId')
    user: UserModel
}