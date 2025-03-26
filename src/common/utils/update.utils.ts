export function RemoveNullProperty(obj: Object): Object {
    Object.keys(obj).forEach(element => {
        if (obj[element] == null) {
            delete obj[element]
        }
    });
    return obj
}