import { PartialType } from '@nestjs/swagger';
import { CreatePlateDto, CreateTankerDto } from './create-tanker.dto';

export class UpdateTankerDto extends PartialType(CreateTankerDto) {}
export class UpdatePlateDto extends PartialType(CreatePlateDto) {}
