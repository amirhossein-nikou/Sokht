export function ModifyMobileNumber(mobile: string) {
    if (mobile.charAt(0) == '0') { return mobile }
    if (mobile.charAt(0) !== '0' && (mobile.charAt(0) == '+' || mobile.slice(0, 3) == "+98")) {
        return `0${mobile.slice(3, mobile.length)}`
    }
    if (mobile.charAt(0) !== '0' && mobile.slice(0, 2) == "98") {
        return `0${mobile.slice(2, mobile.length)}`
    }
}