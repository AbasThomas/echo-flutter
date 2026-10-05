import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { AiService, Msg } from '../ai/ai.service';

const ALLOWED = /^audio\/(mp4|m4a|x-m4a|aac|mpeg|mp3|wav|x-wav|webm|ogg|flac)$/;

@Controller('voice')
export class VoiceController {
  constructor(private readonly ai: AiService) {}

  @Post('turn')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async turn(@UploadedFile() audio: Express.Multer.File, @Body('history') history?: string) {
    if (!audio || audio.size < 1000) throw new BadRequestException('Recording is empty or too short. Try again.');
    if (!ALLOWED.test(audio.mimetype)) throw new BadRequestException('Unsupported audio format.');
    const transcript = await this.ai.transcribe(audio); // audio is never persisted
    if (!transcript) throw new BadRequestException('Nothing was heard. Try again.');
    let ctx: Msg[] = [];
    try { ctx = history ? JSON.parse(history) : []; } catch { /* ignore bad context */ }
    const response = await this.ai.reply([...ctx, { role: 'user', content: transcript }]);
    return { requestId: randomUUID(), transcript, response };
  }
}
