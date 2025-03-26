import { UserModel } from "src/modules/user/models/user.model"
import { UserDetails } from "../types/user.type"

declare global {
    namespace Express {
        interface Request {
            user?: UserModel | UserDetails
        }
    }
}
declare module "express-serve-static-core" {
    interface Request {
        user?: UserModel | UserDetails
    }
}