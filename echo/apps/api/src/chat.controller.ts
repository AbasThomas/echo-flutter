import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService, Msg } from './ai/ai.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly ai: AiService) {}

  @Post()
  async chat(@Body() body: { text?: string; history?: Msg[]; fast?: boolean }) {
    const text = body?.text?.trim();
    if (!text || text.length > 2000) throw new BadRequestException('Send text between 1 and 2000 characters.');
    const response = await this.ai.reply([...(body.history ?? []), { role: 'user', content: text }], body.fast);
    return { requestId: randomUUID(), response };
  }
}
