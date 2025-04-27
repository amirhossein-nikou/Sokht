import { isNumberString } from "class-validator"

export function StringToArray(field: any) {
    if (field) {
        if (typeof field == "string") {
            if (field.indexOf(",") >= 0) {
                field = (field.split(","))?.map(item => item.trim().replace(/[\]\[\"\']+/gi, ""))
            } else {
                field = [field]
            }
        }
        if (Array.isArray(field)) {
            field = field?.map(item => item.trim())
            field = [... new Set(field)]
        }
    } else {
        field = []
    }
    field.forEach(item => {
        if (isNumberString(item)) {
            field = [Number(item)]
        }
    });
    return field
}