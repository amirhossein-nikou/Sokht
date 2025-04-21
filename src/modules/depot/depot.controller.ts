import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DepotService } from './depot.service';
import { CreateDepotDto, UpdateDepotDto } from './dto/depot.dto';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from '../user/enum/role.enum';

@Controller('depot')
@UserAuthGuard()
@CanAccess(UserRole.HeadUser)
export class DepotController {
  constructor(private readonly depotService: DepotService) {}
  @Post('/create')
  create(@Body() createDepotDto: CreateDepotDto) {
    return this.depotService.create(createDepotDto);
  }
  @Get('/list')
  findAll() {
    return this.depotService.findAll();
  }

  @Get('/get-one/:id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.depotService.findOne(id);
  }

  @Patch('/update/:id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateDepotDto: UpdateDepotDto) {
    return this.depotService.update(id, updateDepotDto);
  }

  @Delete('/remove/:id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.depotService.remove(id);
  }
}
