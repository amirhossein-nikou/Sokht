import { ModelType } from "sequelize-typescript"

export type IncludeType = {
    as: string,
    model: ModelType<any, any>
}