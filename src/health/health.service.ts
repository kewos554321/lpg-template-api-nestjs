import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getStatus(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
