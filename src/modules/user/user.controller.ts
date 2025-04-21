import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { UserRole } from './enum/role.enum';
import { PremiumRoles } from 'src/common/enums/otherRole.enum';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/create')
    @UserAuthGuard()
    @CanAccess(PremiumRoles.Boss) // main admin
    @MyApiConsumes()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
    @Post('/sub-user')
    @MyApiConsumes()
    @UserAuthGuard()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    addSubUser(@Body() addSubUserDto: AddSubUserDto) {
        return this.userService.addSubUsers(addSubUserDto);
    }

    @Get('/list')
    @MyApiConsumes()
    @UserAuthGuard()
    @CanAccess(PremiumRoles.Boss,PremiumRoles.Admin)
    findAll() {
        return this.userService.findAll();
    }

    @Get('/by-id/:id')
    @MyApiConsumes()
    @CanAccess(PremiumRoles.Boss)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }
    @Get('/search/:search')
    @MyApiConsumes()
    @CanAccess(PremiumRoles.Boss)
    searchUser(@Param('search') search: string) {
        return this.userService.searchUser(search);
    }
    @Get('/profile')
    @MyApiConsumes()
    @UserAuthGuard()
    profile() {
        return this.userService.profile();
    }
    // @Patch(':id')
    // @MyApiConsumes()
    // update(@Param('id',ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    //   return this.userService.update(+id, updateUserDto);
    // }

    @Delete('/remove/:id')
    @MyApiConsumes()
    @UserAuthGuard()
    @CanAccess(PremiumRoles.Boss) // main admin
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
    @Delete('/removeSub/:id')
    @MyApiConsumes()
    @UserAuthGuard()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    removeSubUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.removeSubUser(id);
    }
}

