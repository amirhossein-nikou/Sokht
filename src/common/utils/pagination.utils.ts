import { PaginationDto } from "../dto/pagination.dto";

export function paginationSolver(paginationDto: PaginationDto) {
    let { limit = 10, page = 0 } = paginationDto;
    if (!page || page <= 1) page = 0
    else page = page - 1

    if (!limit || limit <= 0) limit = 10
    let skip = page * limit;
    return {
        skip,
        limit,
        page: page //=== 0 ? 1 : page
    }
}
export function paginationGenerator(limit: number, page: number, count: number) { 
    return{
        totalCount: count,
        page: +page+1,
        limit: +limit, //count of data for show 
        pageCount: Math.ceil(count/limit)
    }
}