/* eslint-disable no-console*/

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: '用户管理功能已被禁用。'
    },
    { status: 400 }
  );
}
