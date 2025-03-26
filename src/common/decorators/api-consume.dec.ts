import { applyDecorators } from "@nestjs/common";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "../enums/swagger-consumes.enum";

export function MyApiConsumes() {
    return applyDecorators(
        ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
    )
}