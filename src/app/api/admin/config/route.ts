/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { AdminConfig, AdminConfigResult } from '@/lib/admin.types';
import { getConfig } from '@/lib/config';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const config = await getConfig();
    const result: AdminConfigResult = {
      Role: 'owner', // No more users, so everyone is an owner
      Config: config,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store', // Admin config should not be cached
      },
    });
  } catch (error) {
    console.error('获取管理员配置失败:', error);
    return NextResponse.json(
      {
        error: '获取管理员配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig: AdminConfig = await request.json();
    if (!newConfig || typeof newConfig !== 'object') {
      return NextResponse.json({ error: 'Invalid config data' }, { status: 400 });
    }

    await db.saveAdminConfig(newConfig);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存管理员配置失败:', error);
    return NextResponse.json(
      {
        error: '保存管理员配置失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
