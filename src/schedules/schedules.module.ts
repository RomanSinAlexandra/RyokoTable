import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { SchedulesController } from './schedules.controller.js';

@Module({
  providers: [SchedulesService],
  controllers: [SchedulesController]
})
export class SchedulesModule {}
