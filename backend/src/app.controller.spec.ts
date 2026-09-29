import {
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { DataSource } from 'typeorm';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule =
      await Test.createTestingModule({
        controllers: [
          AppController,
        ],

        providers: [
          {
            provide: DataSource,
            useValue: {
              query: async () => [
                { result: 1 },
              ],
            },
          },
        ],
      }).compile();

    appController =
      app.get<AppController>(
        AppController,
      );
  });

  describe('health', () => {
    it('returns healthy status when the database is reachable', async () => {
      await expect(
        appController.getHealth(),
      ).resolves.toEqual({
        status: 'ok',
        database: 'connected',
      });
    });
  });
});