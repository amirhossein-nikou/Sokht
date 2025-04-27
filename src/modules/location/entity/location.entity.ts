import { EntityName } from "src/common/enums/entity.enum";
import { DepotEntity } from "src/modules/depot/entity/depot.entity";
import { StationEntity } from "src/modules/station/entity/station.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity(EntityName.Location)
export class LocationEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    address: string;
    @Column({type: 'numeric'})
    lat: number;
    @Column({type: 'numeric'})
    lon: number;
    @OneToOne(() => StationEntity, (station) => station.location)
    station: StationEntity;
    @OneToOne(() => DepotEntity,depot => depot.location)
    depot: DepotEntity
}
