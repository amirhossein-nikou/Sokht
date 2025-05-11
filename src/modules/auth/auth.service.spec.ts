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
    it('should generate Otp', async () => {
        const user: UserEntity = {
            id: 1,
            first_name: "Amirhossein",
            last_name: "Nikoo",
            mobile: "09175500767",
            national_code: "3530236942",
            role: UserRole.HeadUser,
            certificateId: null,
            verify_mobile: true,
            parentId: null,
            parent: null,
            child: [],
            newMobile: null,
            depot: null,
            otp: null,
            otpId:null,
            stations:[],
            tanker: null,
            tickets:[]
        }
        const code = await service.createOtpForUser(user)
        console.log(code);
        expect(code).toHaveLength(5)
    });
})