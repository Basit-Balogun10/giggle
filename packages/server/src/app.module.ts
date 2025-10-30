import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaystackController } from './paystack.controller';
import { ConvexService } from './convex.service';
import { GigsController } from './gigs.controller';
import { BidsController } from './bids.controller';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [AppController, PaystackController, GigsController, ClaimsController, BidsController],
  providers: [
    AppService,
    ConvexService,
    { provide: APP_GUARD, useClass: AuthGuard },
    // Bind ClaimsService to a string token so tests can reliably override the provider
    { provide: 'ClaimsService', useClass: ClaimsService },
  ],
})
export class AppModule {}
