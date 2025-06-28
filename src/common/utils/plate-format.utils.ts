import { CreatePlateDto } from "src/modules/tanker/dto/create-tanker.dto";

export function plateFormat(createPlateDto: CreatePlateDto):string{
    const {char,city,first,second} = createPlateDto
    return `${first}-${char}-${second}/${city}`
}