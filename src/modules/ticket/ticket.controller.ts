import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerFile, multerStorageDisc } from 'src/common/utils/multer.utils';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { uploadedFilesOptional } from 'src/common/decorators/upload-file.decorator';
import { UploadImage } from 'src/common/interceptors/multer.interceptor';

@Controller('ticket')
@UserAuthGuard()
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post('/create')
  @UseInterceptors(UploadImage('file'))
  @ApiConsumes(SwaggerConsumes.MultiPartData, SwaggerConsumes.Json)
  create(
    @uploadedFilesOptional() file: multerFile,
    @Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto,file);
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
  @MyApiConsumes()
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete('/remove/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.remove(id);
  }
}
