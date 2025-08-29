import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: '登录功能已被禁用。'
    },
    { status: 400 }
  );
}
