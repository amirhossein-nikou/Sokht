import { Injectable } from '@nestjs/common';
import { CreateDepotDto, UpdateDepotDto } from './dto/depot.dto';

@Injectable()
export class DepotService {
  create(createDepotDto: CreateDepotDto) {
    return 'This action adds a new depot';
  }

  findAll() {
    return `This action returns all depot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} depot`;
  }

  update(id: number, updateDepotDto: UpdateDepotDto) {
    return `This action updates a #${id} depot`;
  }

  remove(id: number) {
    return `This action removes a #${id} depot`;
  }
}
