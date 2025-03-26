import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import { StationModel } from "src/modules/station/models/station.model";

@Table({ tableName: 'location',createdAt: false,updatedAt: false })
export class LocationModel extends Model<LocationModel> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;
    @Column({ type: DataType.DECIMAL, allowNull: false })
    lat: number;
    @Column({ type: DataType.DECIMAL, allowNull: false })
    lon: number;
    @BelongsTo(() => StationModel,'id')
    station: StationModel;
}
