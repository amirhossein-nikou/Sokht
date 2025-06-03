import { HttpStatus, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { Repository } from 'typeorm';
import { payloadType } from '../auth/types/payload';
import { UserEntity } from '../user/entity/user.entity';
import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationEntity } from './entity/notification.entity';
import { NotificationMessages } from './enums/message.enum';
import { DataType } from './types/message.type';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @Inject(REQUEST) private req: Request,
        private jwtService: JwtService,
    ) { }
    async create(createNotificationDto: CreateNotificationDto) {
        try {
            const { description, title, userId, parentId } = createNotificationDto
            const notification = this.notificationRepository.create({ description, title, userId, parentId })
            await this.notificationRepository.save(notification)
            return notification
        } catch (error) {
            throw error
        }
    }

    async findAll(data: DataType) {
        try {
            const { token, pagination } = data
            const user = await this.validateToken(token)
            const { limit, page, skip } = paginationSolver(pagination)
            const [notifications, count] = await this.notificationRepository.findAndCount({
                where: { userId: user.id },
                take: limit,
                skip
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: notifications
            }
        } catch (error) {
            throw error
        }
    }
    async findAllRoute(pagination: PaginationDto) {
        try {
            const { id, parentId } = this.req.user
            const { limit, page, skip } = paginationSolver(pagination)
            let where: object = { userId: id, parentId }
            if (!parentId) {
                where = { parentId: id }
            }
            const [notifications, count] = await this.notificationRepository.findAndCount({
                where,
                take: limit,
                skip
            })
            return {
                statusCode: HttpStatus.OK,
                pagination: paginationGenerator(limit, page, count),
                data: notifications
            }
        } catch (error) {
            throw error
        }
    }

    async findOne(id: number) {
        try {
            const notification = await this.notificationRepository.findOneBy({ id })
            if (!notification) throw new NotFoundException(NotificationMessages.Notfound)
            return {
                statusCode: HttpStatus.OK,
                data: notification,
            }
        } catch (error) {
            throw error
        }
    }

    async remove(id: number) {
        try {
            const notification = await this.getOneById(id)
            await this.notificationRepository.remove(notification)
            return {
                status: HttpStatus.OK,
                message: NotificationMessages.Remove
            }
        } catch (error) {
            throw error
        }
    }
    // utils
    async getOneById(id: number) {
        const notification = await this.notificationRepository.findOneBy({ id })
        if (!notification) throw new NotFoundException(NotificationMessages.Notfound)
        return notification
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify<payloadType>(token, {
                secret: process.env.ACCESS_TOKEN_SECRET
            })
            if (typeof payload === "object" && payload?.id) {
                const user = await this.userRepository.findOne({ where: { id: payload.id } })
                if (!user) throw new UnauthorizedException("please login to your account")
                return {
                    mobile: user.mobile,
                    id: user.id,
                    role: user.role,
                    parentId: user.parentId
                }
            }
            throw new UnauthorizedException("please login to your account")
        } catch (error) {
            throw new UnauthorizedException("please login to your account")
        }

    }
}
