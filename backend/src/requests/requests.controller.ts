import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestStatus } from './request-status.enum';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: RequestStatus,
  ) {
    return this.requestsService.updateStatus(id, status);
  }
}