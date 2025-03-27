import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SaleService } from '../services/sale.service';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';


@Controller('station/sale')
@UserAuthGuard()
export class SaleController {
  constructor(private readonly saleService: SaleService) {}
  @MyApiConsumes()
  @Post('/create')
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get('/list')
  findAll() {
    return this.saleService.findAll();
  }

  @Get('/get-one/:id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }
  @MyApiConsumes()
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  @Delete('/remove/:id')
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
}
