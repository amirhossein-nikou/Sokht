import { PaginationDto } from "src/common/dto/pagination.dto"

export type DataType = {
    token: string,
    pagination: PaginationDto,
    created_at: Date
}