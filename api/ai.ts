import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAiRequest, type GenerateBody } from './_lib/handleAiRequest.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { status, body } = await handleAiRequest(
    req.method ?? 'GET',
    req.body as GenerateBody | undefined,
    req.headers.authorization,
  );
  res.status(status).json(body);
}
