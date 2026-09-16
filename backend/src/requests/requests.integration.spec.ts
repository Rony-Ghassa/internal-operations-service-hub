import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { RequestsService } from './requests.service';
import { ServiceRequest } from './request.entity';
import { RequestStatus } from './request-status.enum';

describe('RequestsService database integration', () => {
  let dataSource: DataSource;
  let repository: Repository<ServiceRequest>;
  let service: RequestsService;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [ServiceRequest],
      synchronize: true,
    });

    await dataSource.initialize();

    repository = dataSource.getRepository(ServiceRequest);
    service = new RequestsService(repository);
  });

  beforeEach(async () => {
    await repository.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('saves a Service Request in the database', async () => {
    const createdRequest = await service.createRequest(
      1,
      'Password Reset',
      'I cannot access my account.',
    );

    const savedRequest = await repository.findOne({
      where: { id: createdRequest.id },
    });

    expect(savedRequest).not.toBeNull();
    expect(savedRequest?.requestType).toBe('Password Reset');
    expect(savedRequest?.department).toBe('IT');
    expect(savedRequest?.status).toBe(RequestStatus.SUBMITTED);
    expect(savedRequest?.createdByUserId).toBe(1);
  });
});