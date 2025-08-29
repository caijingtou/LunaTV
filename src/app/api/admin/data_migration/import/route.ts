/* eslint-disable @typescript-eslint/no-explicit-any,no-console */

import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { gunzip } from 'zlib';

import { configSelfCheck, setCachedConfig } from '@/lib/config';
import { SimpleCrypto } from '@/lib/crypto';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const gunzipAsync = promisify(gunzip);

export async function POST(req: NextRequest) {
  try {
    // All auth and storage type checks are removed.

    // 解析表单数据
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;

    if (!file) {
      return NextResponse.json({ error: '请选择备份文件' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: '请提供解密密码' }, { status: 400 });
    }

    // 读取文件内容
    const encryptedData = await file.text();

    // 解密数据
    let decryptedData: string;
    try {
      decryptedData = SimpleCrypto.decrypt(encryptedData, password);
    } catch (error) {
      return NextResponse.json({ error: '解密失败，请检查密码是否正确' }, { status: 400 });
    }

    // 解压缩数据
    const compressedBuffer = Buffer.from(decryptedData, 'base64');
    const decompressedBuffer = await gunzipAsync(compressedBuffer);
    const decompressedData = decompressedBuffer.toString();

    // 解析JSON数据
    let importData: any;
    try {
      importData = JSON.parse(decompressedData);
    } catch (error) {
      return NextResponse.json({ error: '备份文件格式错误' }, { status: 400 });
    }

    // 验证数据格式
    if (!importData.data || !importData.data.adminConfig) {
      return NextResponse.json({ error: '备份文件格式无效' }, { status: 400 });
    }

    // 开始导入数据 - 先清空现有数据
    await db.clearAllData();

    // 导入管理员配置
    importData.data.adminConfig = configSelfCheck(importData.data.adminConfig);
    await db.saveAdminConfig(importData.data.adminConfig);
    await setCachedConfig(importData.data.adminConfig);

    // Import data for the new single-user structure
    const data = importData.data;
    if (data.playRecords) {
        await (db as any).saveCollection('playRecords', data.playRecords);
    }
    if (data.favorites) {
        await (db as any).saveCollection('favorites', data.favorites);
    }
    if (data.searchHistory) {
        await (db as any).saveCollection('searchHistory', data.searchHistory);
    }
    if (data.skipConfigs) {
        await (db as any).saveCollection('skipConfigs', data.skipConfigs);
    }

    return NextResponse.json({
      message: '数据导入成功',
      timestamp: importData.timestamp,
      serverVersion: typeof importData.serverVersion === 'string' ? importData.serverVersion : '未知版本'
    });

  } catch (error) {
    console.error('数据导入失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '导入失败' },
      { status: 500 }
    );
  }
}
