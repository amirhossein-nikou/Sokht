import * as moment from 'moment-jalaali';
let counter = 0
let lastDay = '04'
export function CreateNumber(fuelType: number) {
    const year = moment(new Date()).format('jYY')
    const month = moment(new Date()).format('jMM')
    const day = moment(new Date()).format('jDD')
    if (Number(lastDay) != Number(day)) {
        lastDay = day
        counter = 0
    }
    counter += 1
    const number = `${year.charAt(1)}${month}${day}${fuelType}${counter.toString().padStart(4,'0')}`
    return number
}