namespace NodeJS {
    interface ProcessEnv {
        DB_HOST: string,
        DB_PASSWORD: string,
        DB_USERNAME: string,
        DB_PORT: number,
        DB_DATABASE: string,
        ACCESS_TOKEN_SECRET: string,
        REFRESH_TOKEN_SECRET: string,
    }
}