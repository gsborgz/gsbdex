import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { Collection } from '@models/collection';

const SHARES_DIR = path.join(process.cwd(), 'data', 'shares');

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ message: 'Invalid collection payload' }, { status: 400 });
  }

  await mkdir(SHARES_DIR, { recursive: true });

  const code = randomUUID();

  await writeFile(path.join(SHARES_DIR, `${code}.json`), JSON.stringify(body as Collection), 'utf-8');

  return NextResponse.json({ code });
}
