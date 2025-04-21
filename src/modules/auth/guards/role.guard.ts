import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { ROLE } from "src/common/decorators/role.decorator";
import { PremiumRoles } from "src/common/enums/otherRole.enum";
import { UserRole } from "src/modules/user/enum/role.enum";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const requireRoles: UserRole | PremiumRoles = this.reflector.getAllAndOverride(ROLE,
            [context.getHandler(), context.getClass()]
        )
        const userRole =request?.user.role
        if(!requireRoles || requireRoles.length <= 0 ) return true
        if(requireRoles.includes(userRole)) return true
        throw new ForbiddenException('you are not allowed to access this part')
    }

}