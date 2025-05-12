import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { OtpEntity } from './entity/otp.entity';
import { UserEntity } from '../user/entity/user.entity';
import { UserRole } from '../user/enum/role.enum';
jest.mock('../../common/utils/mobile.utils');
describe("Test OTP Service", () => {
    let service: AuthService;
    let OtpRepository: Repository<OtpEntity>;
    let UserRepository: Repository<UserEntity>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, JwtService,
                {
                    provide: getRepositoryToken(OtpEntity),
                    useClass: Repository
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository
                }
            ],
        }).compile();
        service = module.get<AuthService>(AuthService)
        OtpRepository = module.get<Repository<OtpEntity>>(getRepositoryToken(OtpEntity));
        UserRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    })
    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(OtpRepository).toBeDefined();
        expect(UserRepository).toBeDefined();
    });

})