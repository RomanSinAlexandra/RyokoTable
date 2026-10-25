import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'; // <-- Добавлено .js

@Injectable()
export class SchedulesService {
    constructor(private prisma: PrismaService) {}

    async getOrCreateMonthlySchedule(userId: string, year: number, month: number) {
        let schedule = await this.prisma.workSchedule.findUnique({
            where: { userId_year_month: { userId, year, month } },
            include: { days: { orderBy: { date: 'asc' } } },
        });

        if (!schedule) {
            schedule = await this.generateMonthSchedule(userId, year, month);
        }

        return schedule;
    }

    private async generateMonthSchedule(userId: string, year: number, month: number) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const daysData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            daysData.push({
                date,
                dayNumber: day,
                type: isWeekend ? 'DAY_OFF' : 'WORK',
                hours: isWeekend ? 0 : 8.0,
            });
        }

        return this.prisma.workSchedule.create({
            data: {
                userId,
                year,
                month,
                days: {
                    create: daysData,
                },
            },
            include: { days: { orderBy: { date: 'asc' } } },
        });
    }

    async getYearSchedule(userId: string, year: number) {
        return this.prisma.workSchedule.findMany({
            where: { userId, year },
            include: { days: { orderBy: { date: 'asc' } } },
            orderBy: { month: 'asc' },
        });
    }

    async updateDayDetails(dayId: string, type: string, hours: number) {
        try {
            return await this.prisma.workDay.update({
                where: { id: dayId },
                data: { type, hours },
            });
        } catch {
            throw new NotFoundException(`День с ID ${dayId} не найден`);
        }
    }
}