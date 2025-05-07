import { isNumberString } from "class-validator"
import { StringToArray } from "./stringToArray.utils"
import { BadRequestException } from "@nestjs/common"

export function getIdList(array: []) {
    let idList = []
    StringToArray(array).map(async (item) => {
        if (isNumberString(item)) {
            idList.push(Number(item))
        }
    })
    if (idList.length < array.length) throw new BadRequestException('all values must be number')
    return idList
}