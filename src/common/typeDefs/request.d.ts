import { UserEntity } from "src/modules/user/entity/user.entity"
import { UserDetails } from "../types/user.type"

declare global {
    namespace Express {
        interface Request {
            user?: UserEntity | UserDetails
        }
    }
}
declare module "express-serve-static-core" {
    interface Request {
        user?: UserEntity | UserDetails
    }
}