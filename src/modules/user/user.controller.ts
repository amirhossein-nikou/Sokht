import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MyApiConsumes } from 'src/common/decorators/api-consume.dec';
import { UserAuthGuard } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { PremiumRoles } from 'src/common/enums/otherRole.enum';
import { AddSubUserDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateMobileDto } from './dto/update-user.dto';
import { UserRole } from './enum/role.enum';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/create')
    @UserAuthGuard()
    @CanAccess(PremiumRoles.Boss, PremiumRoles.Head)
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
    @Post('/driver')
    @UserAuthGuard()
    @CanAccess(UserRole.OilDepotUser)
    @MyApiConsumes()
    addDriver(@Body() createUserDto: AddSubUserDto) {
        return this.userService.addDriver(createUserDto);
    }

    @Get('/list')
    @MyApiConsumes()
    @UserAuthGuard()
    @CanAccess(PremiumRoles.Boss, PremiumRoles.Admin)
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
    @Patch('/subUser-phone/:id')
    @MyApiConsumes()
    @UserAuthGuard()
    updateSubUserMobile(@Param('id', ParseIntPipe) id: number, @Body() updateMobileDto: UpdateMobileDto) {
        return this.userService.updateSubUserMobile(id, updateMobileDto);
    }

    @Patch('/mobile')
    @MyApiConsumes()
    @UserAuthGuard()
    updateMyMobile(@Body() updateMobileDto: UpdateMobileDto) {
        return this.userService.updateMyPhone(updateMobileDto);
    }

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

