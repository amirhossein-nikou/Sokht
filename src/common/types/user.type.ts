import { UserRole } from "src/modules/user/enum/role.enum"

export type UserDetails = {
    id: number,
    mobile: string,
    role: UserRole,
    parentId?: number
}
