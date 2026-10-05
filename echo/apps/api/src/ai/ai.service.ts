import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';

const GROQ = 'https://api.groq.com/openai/v1';
const SYSTEM =
  'You are Echo, a voice assistant heard through earbuds. Answer in one to three short spoken sentences. ' +
  'No markdown, lists, or emoji. If asked to translate, give only the translation.';
export type Msg = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AiService {
  private key() {
    const k = process.env.GROQ_API_KEY;
    if (!k) throw new ServiceUnavailableException('AI service is not configured.');
    return k;
  }

  private async call(path: string, init: RequestInit, tries = 3): Promise<any> {
    for (let i = 0; i < tries; i++) {
      const res = await fetch(`${GROQ}${path}`, {
        ...init,
        headers: { ...(init.headers as object), Authorization: `Bearer ${this.key()}` },
        signal: AbortSignal.timeout(30_000),
      }).catch(() => null);
      if (res?.ok) return res.json();
      const retryable = !res || res.status === 429 || res.status >= 500;
      if (!retryable || i === tries - 1) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
    throw new BadGatewayException('The AI provider could not complete the request. Try again.');
  }

  async transcribe(file: Express.Multer.File): Promise<string> {
    const form = new FormData();
    form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'audio.m4a');
    form.append('model', process.env.GROQ_TRANSCRIPTION_MODEL ?? 'whisper-large-v3-turbo');
    form.append('response_format', 'json');
    const data = await this.call('/audio/transcriptions', { method: 'POST', body: form });
    return (data.text ?? '').trim();
  }

  async reply(history: Msg[], fast = false): Promise<string> {
    const model = fast ? process.env.GROQ_FAST_MODEL : process.env.GROQ_PRIMARY_MODEL;
    const data = await this.call('/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model ?? 'openai/gpt-oss-120b',
        messages: [{ role: 'system', content: SYSTEM }, ...history.slice(-12)],
      }),
    });
    return (data.choices?.[0]?.message?.content ?? '').trim();
  }
}
