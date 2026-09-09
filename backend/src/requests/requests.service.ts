import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RequestStatus } from './request-status.enum';

interface InternalRequest {
  id: number;
  status: RequestStatus;
}

@Injectable()
export class RequestsService {
  private requests: InternalRequest[] = [
    { id: 1, status: RequestStatus.SUBMITTED },
    { id: 2, status: RequestStatus.IN_PROGRESS },
    { id: 3, status: RequestStatus.COMPLETED },
    { id: 4, status: RequestStatus.CANCELLED },
  ];

  updateStatus(id: number, newStatus: RequestStatus) {
    const request = this.requests.find((request) => request.id === id);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.SUBMITTED]: [
        RequestStatus.IN_PROGRESS,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.IN_PROGRESS]: [
        RequestStatus.COMPLETED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.COMPLETED]: [],
      [RequestStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[request.status].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${request.status} to ${newStatus}`,
      );
    }

    const previousStatus = request.status;
    request.status = newStatus;

    return {
      id: request.id,
      previousStatus,
      newStatus: request.status,
    };
  }
}