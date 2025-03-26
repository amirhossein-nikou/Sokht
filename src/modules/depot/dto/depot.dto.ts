import { PartialType } from '@nestjs/swagger';
export class CreateDepotDto {}

export class UpdateDepotDto extends PartialType(CreateDepotDto) {}
