export const StringToBoolean = (value: any): boolean => {
    if ([true, 'true'].includes(value)) return true
    if ([false, 'false'].includes(value)) return false
    return null
}