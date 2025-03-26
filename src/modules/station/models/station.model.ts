import { BelongsTo, Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { AverageSaleModel } from "src/modules/station/models/sale.model";
import { LocationModel } from "src/modules/location/models/location.model";
import { UserModel } from "src/modules/user/models/user.model";
import { InventoryModel } from "./inventory.model";

@Table({ tableName: 'station', updatedAt: false })
export class StationModel extends Model<StationModel> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;
    @Column({ type: DataType.STRING, allowNull: false })
    name: string;
    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    isActive: boolean;
    @Column({ type: DataType.INTEGER, allowNull: true })
    ownerId: number;
    @Column({ type: DataType.INTEGER, allowNull: true })
    locationId: number;
    @BelongsTo(() => UserModel, 'id')
    owner: UserModel;
    @HasOne(() => LocationModel, 'id')
    location: LocationModel
    @HasMany(() => AverageSaleModel, 'stationId')
    average_sales: AverageSaleModel[]
    @HasMany(() => InventoryModel, 'stationId')
    inventories: InventoryModel[]
}
