import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]),AuthModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TypeOrmModule,TicketService]
})
export class TicketModule {}
