import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@lib/redis';
import { shareKey } from '@lib/collectionShare';
import { Collection } from '@models/collection';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!UUID_PATTERN.test(code)) {
    return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
  }

  const collection = await redis.get<Collection>(shareKey(code));

  if (!collection) {
    return NextResponse.json({ message: 'Code not found' }, { status: 404 });
  }

  return NextResponse.json(collection);
}
