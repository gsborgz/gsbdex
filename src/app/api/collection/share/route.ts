import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { redis } from '@lib/redis';
import { shareKey } from '@lib/collectionShare';
import { Collection } from '@models/collection';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ message: 'Invalid collection payload' }, { status: 400 });
  }

  const code = randomUUID();

  await redis.set(shareKey(code), body as Collection);

  return NextResponse.json({ code });
}
