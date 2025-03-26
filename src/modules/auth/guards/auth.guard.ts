import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";
import { AuthMessages } from "../enum/auth.message";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isSkippedAuth: boolean = this.reflector.get<boolean>(SKIP_AUTH, context.getHandler());
        if (isSkippedAuth) return true
        const request = context.switchToHttp().getRequest<Request>()
        const token = this.extractToken(request)
        request.user = await this.authService.validateToken(token);
        return !!token;
    }

    extractToken(request: Request) {
        const { authorization } = request.headers
        if (!authorization || authorization?.trim() == "") {
            throw new UnauthorizedException(AuthMessages.AuthError)
        }
        const [bearer, token] = authorization?.split(" ");
        if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token)) {
            throw new UnauthorizedException(AuthMessages.AuthError)
        }
        return token;
    }

}