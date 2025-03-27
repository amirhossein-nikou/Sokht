import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export function SequelizeConfig(): TypeOrmModuleOptions {
    const { DB_PORT, DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USERNAME } = process.env
    return {
        type: "postgres",
        host: DB_HOST,
        database: DB_DATABASE,
        password: DB_PASSWORD,
        username: DB_USERNAME,
        port: DB_PORT,
        synchronize: true,
        autoLoadEntities: true,
    }
}