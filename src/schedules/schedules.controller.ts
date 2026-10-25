import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';

@Controller('schedules')
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) {}

    @Get(':userId')
    async getMonthlySchedule(
        @Param('userId') userId: string,
        @Query('year') year: string,
        @Query('month') month: string,
    ) {
        return this.schedulesService.getOrCreateMonthlySchedule(
            userId,
            parseInt(year, 10),
            parseInt(month, 10),
        );
    }

    @Get(':userId/year')
    async getYearSchedule(
        @Param('userId') userId: string,
        @Query('year') year: string,
    ) {
        return this.schedulesService.getYearSchedule(userId, parseInt(year, 10));
    }

    @Patch('day/:dayId')
    async updateDay(
        @Param('dayId') dayId: string,
        @Body('type') type: string,
        @Body('hours') hours: number,
    ) {
        return this.schedulesService.updateDayDetails(dayId, type, hours);
    }
}