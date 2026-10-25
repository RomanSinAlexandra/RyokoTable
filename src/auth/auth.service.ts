import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async register(dto: { email: string; password: string; name?: string }) {
        // Проверяем, есть ли уже такой пользователь
        const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });

        if (existingUser) {
        throw new BadRequestException('Агент с таким email уже существует');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Создаем пользователя в SQLite
        const user = await this.prisma.user.create({
        data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
        },
        });

        return { 
        success: true, 
        userId: user.id, 
        email: user.email, 
        name: user.name 
        };
    }

    async login(dto: { email: string; password: string }) {
        // Ищем пользователя
        const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });

        if (!user) {
        throw new UnauthorizedException('Неверный email или пароль');
        }

        // Сверяем пароль
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный email или пароль');
        }

        return {
        message: 'Авторизация успешна',
        userId: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        };
    }
}