import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SaleService } from '../services/sale.service';
import { CreateSaleDto, UpdateSaleDto } from '../dto/sale.dto';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/modules/user/enum/role.enum';
import { PaginationDec } from 'src/common/decorators/paginatio.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Controller('station/sale')
@UserAuthGuard()
export class SaleController {
  constructor(private readonly saleService: SaleService) { }
  @MyApiConsumes()
  @Post('/create')
  @CanAccess(UserRole.HeadUser)
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get('/list')
  @CanAccess(UserRole.HeadUser)
  @PaginationDec()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.saleService.findAll(paginationDto);
  }

  @Get('/get-one/:id')
  @CanAccess(UserRole.HeadUser)
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }
  // @MyApiConsumes()
  // @Patch('/update/:id')
  // @CanAccess(UserRole.HeadUser)
  // update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
  //   return this.saleService.update(+id, updateSaleDto);
  // }

  @Delete('/remove/:id')
  @CanAccess(UserRole.HeadUser)
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
}
