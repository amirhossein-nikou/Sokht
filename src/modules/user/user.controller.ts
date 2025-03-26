import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/create')
  @MyApiConsumes()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('/sub-user')
  @MyApiConsumes()
  @UserAuthGuard()
  addSubUser(@Body() addSubUserDto: AddSubUserDto) {
    return this.userService.addSubUsers(addSubUserDto);
  }

  @Get('/list')
  @MyApiConsumes()
  findAll() {
    return this.userService.findAll();
  }

  @Get('/by-id/:id')
  @MyApiConsumes()
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // @Patch(':id')
  // @MyApiConsumes()
  // update(@Param('id',ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete('/remove/:id')
  @MyApiConsumes()
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
