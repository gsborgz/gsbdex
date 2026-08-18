import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@lib/redis';
import { Collection, CollectionEntry } from '@models/collection';

const COLLECTION_KEY = 'collection';

async function readCollection(): Promise<Collection> {
  const collection = await redis.get<Collection>(COLLECTION_KEY);

  return collection ?? {};
}

async function writeCollection(collection: Collection): Promise<void> {
  await redis.set(COLLECTION_KEY, collection);
}

export async function GET() {
  const collection = await readCollection();

  return NextResponse.json(collection);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, owned, fullArt } = body as { id: string; owned?: boolean; fullArt?: boolean };

  if (!id) {
    return NextResponse.json({ message: 'Missing pokemon id' }, { status: 400 });
  }

  const collection = await readCollection();
  const current: CollectionEntry = collection[id] || { owned: false, fullArt: false };
  const updated: CollectionEntry = {
    owned: owned ?? current.owned,
    fullArt: fullArt ?? current.fullArt,
  };

  collection[id] = updated;

  await writeCollection(collection);

  return NextResponse.json(updated);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ message: 'Invalid collection payload' }, { status: 400 });
  }

  await writeCollection(body as Collection);

  return NextResponse.json(body);
}
