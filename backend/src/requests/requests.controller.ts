import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestStatus } from './request-status.enum';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  createRequest(
    @Headers('x-user-id') userId: string,
    @Body('requestType') requestType: string,
    @Body('description') description: string,
  ) {
    return this.requestsService.createRequest(
      Number(userId),
      requestType,
      description,
    );
  }

  @Get(':id')
  getRequest(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userId: string,
  ) {
    return this.requestsService.getRequestForUser(id, Number(userId));
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: RequestStatus,
  ) {
    return this.requestsService.updateStatus(id, status);
  }
}