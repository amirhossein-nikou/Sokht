export function RemoveNullProperty(obj: Object): Object | null {
    Object.keys(obj).forEach(element => {
        if (obj[element] == null || obj[element] == "0" || (typeof obj[element] == 'number' && (obj[element] == 0))) {
            delete obj[element]
        }
    });
    if(Object.keys(obj).length == 0) return null
    return obj
}