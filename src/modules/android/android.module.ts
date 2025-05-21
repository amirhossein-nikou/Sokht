import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { RequestModule } from '../request/request.module';
import { AndroidController } from './android.controller';
import { TankerModule } from '../tanker/tanker.module';


@Module({
    imports: [
        AuthModule, InventoryModule, RequestModule, UserModule,TankerModule
    ],
    controllers: [AndroidController],
    providers: [],
})
export class AndroidModule { }