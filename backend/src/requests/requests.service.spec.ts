import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RequestsService } from './requests.service';
import { ServiceRequest } from './request.entity';
import { RequestStatus } from './request-status.enum';
import { FakeRequestClassifier } from './fake-request-classifier';

describe('RequestsService', () => {
  let service: RequestsService;
  let repository: Repository<ServiceRequest>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<ServiceRequest>;

    service = new RequestsService(
      repository,
      new FakeRequestClassifier(),
    );
  });

  it('rejects changing a Completed request to Cancelled', async () => {
    const completedRequest: ServiceRequest = {
      id: 1,
      requestType: 'Password Reset',
      department: 'IT',
      description: 'Cannot access account',
      status: RequestStatus.COMPLETED,
      createdByUserId: 1,
    };

    jest
      .mocked(repository.findOne)
      .mockResolvedValue(completedRequest);

    await expect(
      service.updateStatus(1, RequestStatus.CANCELLED),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});