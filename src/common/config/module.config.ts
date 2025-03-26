import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfig } from './database.config';
import { ConfigModule } from "@nestjs/config";
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: join(process.cwd(),".env"),
        isGlobal: true
    }),
    SequelizeModule.forRoot(SequelizeConfig())

  ],
  controllers: [],
  providers: [],
})
export class CustomModule {}
