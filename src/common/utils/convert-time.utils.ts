import * as moment from 'moment-jalaali';
import { ValueTransformer } from "typeorm";
export const DateToJalali: ValueTransformer = {
    to(value: Date) { return value },
    from(value) {
        if (value) {
            return moment(value).locale('fa').format('jYYYY-jMM-jDD HH:mm:ss')
        }
    }
}
export function jalaliDate(value: Date):string {
    return moment(value).locale('fa').format('jYYYY-jMM-jDD HH:mm:ss')
}