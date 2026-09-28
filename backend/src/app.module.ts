import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestsModule } from './requests/requests.module';
import { ServiceRequest } from './requests/request.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || 'service-hub.db',
      entities: [ServiceRequest],
      synchronize: true,
    }),

    RequestsModule,
  ],

  controllers: [AppController],
})
export class AppModule {}