import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePlateDto, CreateTankerDto } from './create-tanker.dto';
import { IsNumberString, IsOptional } from 'class-validator';

export class UpdateTankerDto extends PartialType(CreateTankerDto) { }

export class UpdatePlateDto extends PartialType(CreatePlateDto) { }
