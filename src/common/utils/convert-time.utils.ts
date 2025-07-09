import * as moment from 'moment-jalaali';
import { ValueTransformer } from "typeorm";
export const DateToJalali: ValueTransformer = {
    to(value: Date) { },
    from(value) {
        if (value) {
            return moment(value).locale('fa').format('jYYYY-jMM-jDD HH:mm:ss')
        }
    }
}