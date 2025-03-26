export function ResponseUtils(status: number, message: string,description?: string) {
    return {
        description,
        status,
        example: {
            status: status,
            data: {
                message: message
            }
        },
    }
}