import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Collection, CollectionEntry } from '@models/collection';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'collection.json');

async function readCollection(): Promise<Collection> {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');

    return JSON.parse(raw);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, '{}', 'utf-8');

    return {};
  }
}

async function writeCollection(collection: Collection): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(collection, null, 2), 'utf-8');
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
