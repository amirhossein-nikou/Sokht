import { PartialType } from '@nestjs/swagger';
import { CreateTankerDto } from './create-tanker.dto';

export class UpdateTankerDto extends PartialType(CreateTankerDto) {}
