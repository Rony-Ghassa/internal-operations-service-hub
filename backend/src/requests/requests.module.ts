import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ServiceRequest } from './request.entity';
import { REQUEST_CLASSIFIER } from './request-classifier';
import { GeminiRequestClassifier } from './gemini-request-classifier';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest])],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    {
      provide: REQUEST_CLASSIFIER,
      useClass: GeminiRequestClassifier,
    },
  ],
})
export class RequestsModule {}