import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from './requests/requests.module';
import { ServiceRequest } from './requests/request.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'service-hub.db',
      entities: [ServiceRequest],
      synchronize: true,
    }),
    RequestsModule,
  ],
})
export class AppModule {}