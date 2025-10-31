import { Module } from '@nestjs/common';
// Legacy NestJS controllers have been migrated to Convex. Keep module minimal.
// AppController/AppService/PaystackController/GigsController/BidsController/ClaimsController
// have been stubbed out and are intentionally not registered here.
import { ConvexService } from './convex.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConvexService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
