import { Module } from '@nestjs/common';
import { SequelizeConfig } from './database.config';
import { ConfigModule } from "@nestjs/config";
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      //.${process.env.NODE_ENV}
      envFilePath: join(process.cwd(), `.env`),
      isGlobal: true
    }),
    TypeOrmModule.forRoot(SequelizeConfig())
  ],
  controllers: [],
  providers: [],
})
export class CustomModule { }
