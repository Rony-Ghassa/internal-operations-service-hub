import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RequestStatus } from './request-status.enum';

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  requestType: string;

  @Column()
  department: string;

  @Column()
  description: string;

  @Column({
    type: 'text',
    default: RequestStatus.SUBMITTED,
  })
  status: RequestStatus;

  @Column()
  createdByUserId: number;
}