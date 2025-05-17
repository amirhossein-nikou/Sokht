import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('ticket')
@UserAuthGuard()
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post('/create')
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }
  @PaginationDec()
  @Get('/list')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ticketService.findAll(paginationDto);
  }

  @Get('/one-by/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }

  @Patch('/update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete('/remove/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.remove(id);
  }
}
