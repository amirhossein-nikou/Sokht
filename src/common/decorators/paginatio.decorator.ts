import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function PaginationDec(){
    return applyDecorators(
        ApiQuery({name:"page" , example: 1 ,required: false}),
        ApiQuery({name:"limit" , example: 10, required: false})
    )
}