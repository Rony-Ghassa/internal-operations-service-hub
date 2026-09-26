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
  constructor(
    private readonly requestsService:
      RequestsService,
  ) {}

  @Post('classify-and-create')
  createFromText(
    @Headers('x-user-id') userId: string,
    @Body('text') text: string,
  ) {
    return this.requestsService.createRequestFromText(
      Number(userId),
      text,
    );
  }

  @Post()
  createRequest(
    @Headers('x-user-id') userId: string,
    @Body('requestType')
    requestType: string,
    @Body('description')
    description: string,
  ) {
    return this.requestsService.createRequest(
      Number(userId),
      requestType,
      description,
    );
  }

  @Get('my')
  getMyRequests(
    @Headers('x-user-id')
    userId: string,
  ) {
    return this.requestsService.getRequestsForUser(
      Number(userId),
    );
  }

  @Get('department/:department')
  getRequestsForDepartment(
    @Param('department')
    department: string,
  ) {
    return this.requestsService.getRequestsForDepartment(
      department,
    );
  }

  @Get(':id')
  getRequest(
    @Param('id', ParseIntPipe)
    id: number,

    @Headers('x-user-id')
    userId: string,
  ) {
    return this.requestsService.getRequestForUser(
      id,
      Number(userId),
    );
  }

  @Patch(':id/cancel')
  cancelRequest(
    @Param('id', ParseIntPipe)
    id: number,

    @Headers('x-user-id')
    userId: string,
  ) {
    return this.requestsService.cancelRequestForUser(
      id,
      Number(userId),
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Headers('x-department')
    department: string,

    @Body('status')
    status: RequestStatus,
  ) {
    return this.requestsService.updateStatusForDepartment(
      id,
      department,
      status,
    );
  }
}