import { BadRequestException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LimitDto } from "../dto/limit.dto";
import { LimitEntity } from "../entity/limit.entity";
import { StationService } from "./station.service";
import * as moment from 'moment-jalaali';
import { StringToBoolean } from "src/common/utils/boolean.utils";
@Injectable()
export class LimitService {
    constructor(
        @InjectRepository(LimitEntity) private limitRepository: Repository<LimitEntity>,
        private stationService: StationService,

    ) { }
    async AddLimit(limitDto: LimitDto) {
        try {
            let { date, stationId, value, by_user } = limitDto
            const station = await this.stationService.findOneById(stationId)
            let limit = await this.getLimitByStationId(station.id)
            if (!date) {
                date = new Date()
            }else{
                date = new Date(date)
            }
            if (limit) {
                limit.date = date
                limit.value = value
                limit.by_user = by_user
            } else {
                limit = this.limitRepository.create({ date, stationId, value, by_user })
            }
            await this.limitRepository.save(limit)
            return {
                statusCode: HttpStatus.OK,
                messages: 'limit add successFully',
                data: limit
            }
        } catch (error) {
            throw error
        }
    }
    //utils
    async getLimitByStationId(stationId: number) {
        const limit = await this.limitRepository.findOneBy({ stationId })
        if (!limit) return null
        return limit
    }
    async checkUpdateLimit(stationId: number) {
        const limit = await this.limitRepository.findOneBy({ stationId })
        if(limit){
            const updated_at = new Date(moment(new Date(limit.updated_at)).format('YYYY-MM-DD'))
            const now = new Date(moment(new Date()).format('YYYY-MM-DD'))
            if (updated_at < now) {
                return await this.AddLimit({ stationId, value: 13500, by_user: false })
            }
        }
    }
}