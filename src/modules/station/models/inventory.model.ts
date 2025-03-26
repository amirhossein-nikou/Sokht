import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { StationModel } from "./station.model";

@Table({ tableName: 'inventory', updatedAt: true, createdAt: false })
export class InventoryModel extends Model<InventoryModel> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;
    @Column({ type: DataType.BIGINT, allowNull: false })
    value: number;
    @Column({
        type: DataType.ENUM,
        values: [FuelTypes.Diesel,
        //FuelTypes.Gas, FuelTypes.Gasoline,
        FuelTypes.Petrol],
        allowNull: false
    })
    fuel_type: FuelTypes;
    @Column({ type: DataType.INTEGER, allowNull: false })
    stationId: number
    @BelongsTo(() => StationModel, 'id')
    station: StationModel
}