import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const SHARES_DIR = path.join(process.cwd(), 'data', 'shares');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!UUID_PATTERN.test(code)) {
    return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
  }

  try {
    const raw = await readFile(path.join(SHARES_DIR, `${code}.json`), 'utf-8');

    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ message: 'Code not found' }, { status: 404 });
  }
}
