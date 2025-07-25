import { HttpStatus, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TicketMessages } from './enum/message.enum';
import { RemoveNullProperty } from 'src/common/utils/update.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { multerFile } from 'src/common/utils/multer.utils';
import { removeFile } from 'src/common/utils/removeFile.utils';
import { getImagePath } from 'src/common/utils/file-path.utils';

@Injectable({ scope: Scope.REQUEST })
export class TicketService {
	constructor(
		@InjectRepository(TicketEntity) private ticketRepository: Repository<TicketEntity>,
		@Inject(REQUEST) private req: Request
	) { }
	async create(createTicketDto: CreateTicketDto, file: multerFile) {
		let filePath = null
		try {
			console.log(`access  -> ${this.req.url}`);
			if (file) {
				filePath = getImagePath(file, file.path)
			}
			const { id } = this.req.user
			const { content, priority, target, title } = createTicketDto
			const ticket = this.ticketRepository.create({
				content, priority, target, title, file: filePath,
				userId: id
			})
			const result = await this.ticketRepository.save(ticket)
			return {
				statusCode: HttpStatus.CREATED,
				message: TicketMessages.Create,
				data: result,
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			if (filePath) {
				removeFile(filePath)
			}
			throw error
		}

	}

	async findAll(paginationDto: PaginationDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { limit, page, skip } = paginationSolver(paginationDto);
			const { id } = this.req.user
			const [tickets, count] = await this.ticketRepository.findAndCount({
				where: { userId: id },
				order: { priority: "ASC" },
				relations: { user: { stations: true } },
				select: {
					user: {
						id: true, first_name: true, last_name: true, mobile: true,
						stations: { id: true, name: true }
					}
				},
				skip,
				take: limit
			})
			return {
				statusCode: HttpStatus.OK,
				pagination: paginationGenerator(limit, page, count),
				data: tickets
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	async findOne(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: userId } = this.req.user
			const ticket = await this.ticketRepository.findOne({
				where: {
					id, userId
				}
			})
			if (!ticket) throw new NotFoundException(TicketMessages.Notfound)
			return {
				statusCode: HttpStatus.OK,
				data: ticket
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	async update(id: number, updateTicketDto: UpdateTicketDto) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: userId } = this.req.user
			await this.getOne(id, userId)
			const updateObject = RemoveNullProperty(updateTicketDto)
			if (updateObject) {
				await this.ticketRepository.update(id, updateObject)
			}
			const result = await this.getOne(id, userId)
			return {
				statusCode: HttpStatus.OK,
				data: result,
				message: TicketMessages.Update
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}

	async remove(id: number) {
		try {
			console.log(`access  -> ${this.req.url}`);
			const { id: userId } = this.req.user
			const ticket = await this.getOne(id, userId)
			await this.ticketRepository.remove(ticket)
			return {
				statusCode: HttpStatus.OK,
				message: TicketMessages.Remove
			}
		} catch (error) {
			console.log(`error -> ${this.req.url} -> `, error.message);
			throw error
		}
	}
	// utils 
	async getOne(id: number, userId: number) {
		const ticket = await this.ticketRepository.findOne({
			where: {
				id, userId
			}
		})
		if (!ticket) throw new NotFoundException(TicketMessages.Notfound)
		return ticket
	}
}
