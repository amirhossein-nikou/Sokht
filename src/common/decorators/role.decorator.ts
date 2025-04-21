import { SetMetadata } from "@nestjs/common"
import { UserRole } from "src/modules/user/enum/role.enum"
import { PremiumRoles } from "../enums/otherRole.enum"

export const ROLE = 'ROLE'

export const CanAccess = (...roles: UserRole[] | PremiumRoles[]) => SetMetadata(ROLE, roles)