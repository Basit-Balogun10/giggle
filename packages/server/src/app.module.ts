import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaystackController } from './paystack.controller';
import { ConvexService } from './convex.service';
import { GigsController } from './gigs.controller';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';

@Module({
  imports: [],
  controllers: [AppController, PaystackController, GigsController, ClaimsController],
  providers: [
    AppService,
    ConvexService,
    // Bind ClaimsService to a string token so tests can reliably override the provider
    { provide: 'ClaimsService', useClass: ClaimsService },
  ],
})
export class AppModule {}
