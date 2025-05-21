import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RequestModule } from '../request/request.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { TankerModule } from '../tanker/tanker.module';
import { UserModule } from '../user/user.module';
import { AndroidController } from './android.controller';
import { AndroidService } from './android.service';


@Module({
    imports: [
        AuthModule, InventoryModule, RequestModule, UserModule,TankerModule
    ],
    controllers: [AndroidController],
    providers: [AndroidService],
    exports: [AndroidService]
})
export class AndroidModule { }