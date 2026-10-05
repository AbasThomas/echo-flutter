import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { AiService } from './ai/ai.service';
import { VoiceController } from './voice/voice.controller';
import { ChatController } from './chat.controller';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }])],
  controllers: [HealthController, VoiceController, ChatController],
  providers: [AiService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
