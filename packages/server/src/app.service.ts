import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok', name: 'Giggle Server', timestamp: Date.now() };
  }
}
