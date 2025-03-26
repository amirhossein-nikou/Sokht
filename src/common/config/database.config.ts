import { SequelizeModuleOptions } from "@nestjs/sequelize";

export function SequelizeConfig(): SequelizeModuleOptions {
    const { DB_PORT, DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USERNAME } = process.env
    return {
        dialect: "postgres",
        host: DB_HOST,
        database: DB_DATABASE,
        password: DB_PASSWORD,
        username: DB_USERNAME,
        port: DB_PORT,
        synchronize: true,
        autoLoadModels: true,
        sync: {alter:true}
    }
}