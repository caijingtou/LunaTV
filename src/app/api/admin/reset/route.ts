/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { resetConfig } from '@/lib/config';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    await resetConfig();

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store', // Do not cache admin actions
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: '重置管理员配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
