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
@UserAuthGuard()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/create')
    @CanAccess(PremiumRoles.Boss, PremiumRoles.Head)
    @MyApiConsumes()
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
    @Post('/sub-user')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    addSubUser(@Body() addSubUserDto: AddSubUserDto) {
        return this.userService.addSubUsers(addSubUserDto);
    }
    @Post('/driver')
    @CanAccess(UserRole.OilDepotUser)
    @MyApiConsumes()
    addDriver(@Body() createUserDto: AddSubUserDto) {
        return this.userService.addDriver(createUserDto);
    }

    @Get('/list')
    @MyApiConsumes()
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
    profile() {
        return this.userService.profile();
    }
    @Patch('/subUser-phone/:id')
    @MyApiConsumes()
    updateSubUserMobile(@Param('id', ParseIntPipe) id: number, @Body() updateMobileDto: UpdateMobileDto) {
        return this.userService.updateSubUserMobile(id, updateMobileDto);
    }

    @Patch('/mobile')
    @MyApiConsumes()
    updateMyMobile(@Body() updateMobileDto: UpdateMobileDto) {
        return this.userService.updateMyPhone(updateMobileDto);
    }

    @Delete('/remove/:id')
    @MyApiConsumes()
    @CanAccess(PremiumRoles.Boss) // main admin
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
    @Delete('/removeSub/:id')
    @MyApiConsumes()
    @CanAccess(UserRole.HeadUser, UserRole.StationUser, UserRole.OilDepotUser)
    removeSubUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.removeSubUser(id);
    }
}

