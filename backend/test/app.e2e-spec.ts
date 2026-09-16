import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { RequestsModule } from '../src/requests/requests.module';
import { ServiceRequest } from '../src/requests/request.entity';

describe('Service Request flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [ServiceRequest],
          synchronize: true,
        }),
        RequestsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a request and lets its owner view it', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/requests')
      .set('x-user-id', '1')
      .send({
        requestType: 'Password Reset',
        description: 'I cannot access my account.',
      })
      .expect(201);

    expect(createResponse.body.department).toBe('IT');
    expect(createResponse.body.status).toBe('Submitted');

    const requestId = createResponse.body.id;

    const viewResponse = await request(app.getHttpServer())
      .get(`/requests/${requestId}`)
      .set('x-user-id', '1')
      .expect(200);

    expect(viewResponse.body.id).toBe(requestId);
    expect(viewResponse.body.createdByUserId).toBe(1);
  });
});