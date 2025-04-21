export function RemoveNullProperty(obj: Object): Object {
    Object.keys(obj).forEach(element => {
        if (obj[element] == null || obj[element] == "0" || (typeof obj[element] == 'number' && (obj[element] == 0))) {
            delete obj[element]
        }
    });
    return obj
}