// src/lib/get-ip.ts
import { NextApiRequest } from 'next';

export function getIpAddress(req: NextApiRequest): string | undefined {
  let ip: string | undefined | string[];
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  } else {
    ip = req.socket?.remoteAddress;
  }
  return ip;
}
