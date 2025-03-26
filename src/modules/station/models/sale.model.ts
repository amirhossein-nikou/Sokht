import { BelongsTo, Column, DataType,  Model, Table } from "sequelize-typescript";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { StationModel } from "src/modules/station/models/station.model";
@Table({ tableName: 'average-sale', updatedAt: false })
export class AverageSaleModel extends Model<AverageSaleModel> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;
    @Column({ type: DataType.DOUBLE, allowNull: false })
    monthly_average_sale: number;
    @Column({
        type: DataType.ENUM,
        values: [FuelTypes.Diesel,
        //FuelTypes.Gas, FuelTypes.Gasoline,
        FuelTypes.Petrol],
        allowNull: false
    })
    fuel_type: FuelTypes;
    @Column({type: DataType.INTEGER,allowNull: true})
    stationId: number
    @BelongsTo(() => StationModel, 'id')
    station: StationModel;
}
