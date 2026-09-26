import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceRequest } from './request.entity';
import { RequestStatus } from './request-status.enum';

import {
  REQUEST_CLASSIFIER,
} from './request-classifier';

import type {
  RequestClassifier,
} from './request-classifier';

import {
  ALLOWED_REQUEST_TYPES,
  isAllowedRequestType,
} from './request-type.validator';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestRepository:
      Repository<ServiceRequest>,

    @Inject(REQUEST_CLASSIFIER)
    private readonly classifier:
      RequestClassifier,
  ) {}

  private readonly requestTypeToDepartment:
    Record<string, string> = {
      'Password Reset': 'IT',
      'Leave Request': 'HR',
      Reimbursement: 'Finance',
      Other: 'Admin Review',
    };

  async createRequest(
    userId: number,
    requestType: string,
    description: string,
  ) {
    const department =
      this.requestTypeToDepartment[requestType];

    if (!department) {
      throw new BadRequestException(
        'Unsupported request type',
      );
    }

    const request =
      this.requestRepository.create({
        requestType,
        department,
        description,
        status:
          RequestStatus.SUBMITTED,
        createdByUserId: userId,
      });

    return this.requestRepository.save(
      request,
    );
  }

  async createRequestFromText(
    userId: number,
    text: string,
  ) {
    try {
      const suggestedType =
        await this.classifier.classify(
          text,
          ALLOWED_REQUEST_TYPES,
        );

      if (
        !isAllowedRequestType(
          suggestedType,
        )
      ) {
        throw new BadRequestException(
          'Unable to classify the request.',
        );
      }

      return this.createRequest(
        userId,
        suggestedType,
        text,
      );
    } catch (error) {
      console.error(
        'Classifier error:',
        error,
      );

      if (
        error instanceof
        BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Unable to classify the request.',
      );
    }
  }

  async getRequestsForUser(
    userId: number,
  ) {
    return this.requestRepository.find({
      where: {
        createdByUserId: userId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async getRequestForUser(
    id: number,
    userId: number,
  ) {
    const request =
      await this.requestRepository.findOne({
        where: { id },
      });

    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }

    if (
      request.createdByUserId !== userId
    ) {
      throw new ForbiddenException(
        'You are not allowed to view this request',
      );
    }

    return request;
  }

  async getRequestsForDepartment(
    department: string,
  ) {
    return this.requestRepository.find({
      where: {
        department,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async cancelRequestForUser(
    id: number,
    userId: number,
  ) {
    const request =
      await this.requestRepository.findOne({
        where: { id },
      });

    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }

    if (
      request.createdByUserId !== userId
    ) {
      throw new ForbiddenException(
        'You can only cancel your own request',
      );
    }

    if (
      request.status ===
        RequestStatus.COMPLETED ||
      request.status ===
        RequestStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `A ${request.status} request cannot be cancelled`,
      );
    }

    request.status =
      RequestStatus.CANCELLED;

    await this.requestRepository.save(
      request,
    );

    return {
      id: request.id,
      newStatus: request.status,
    };
  }

  async updateStatusForDepartment(
    id: number,
    department: string,
    newStatus: RequestStatus,
  ) {
    const request =
      await this.requestRepository.findOne({
        where: { id },
      });

    if (!request) {
      throw new NotFoundException(
        'Request not found',
      );
    }

    if (
      request.department !== department
    ) {
      throw new ForbiddenException(
        'This request is not assigned to your department',
      );
    }

    const allowedTransitions:
      Partial<
        Record<
          RequestStatus,
          RequestStatus[]
        >
      > = {
        [RequestStatus.SUBMITTED]: [
          RequestStatus.IN_PROGRESS,
        ],

        [RequestStatus.IN_PROGRESS]: [
          RequestStatus.COMPLETED,
        ],
      };

    const allowed =
      allowedTransitions[
        request.status
      ] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${request.status} to ${newStatus}`,
      );
    }

    const previousStatus =
      request.status;

    request.status = newStatus;

    await this.requestRepository.save(
      request,
    );

    return {
      id: request.id,
      previousStatus,
      newStatus: request.status,
    };
  }
}