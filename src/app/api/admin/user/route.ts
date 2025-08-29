/* eslint-disable @typescript-eslint/no-explicit-any,no-console */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/admin/user
 * Returns an empty array because user management is disabled.
 */
export async function GET(_request: NextRequest) {
  // User management is disabled, so we always return an empty list.
  // The admin UI might expect the list of users to be in a `users` property.
  return NextResponse.json({ users: [] });
}

/**
 * POST /api/admin/user
 * Returns an error because user management is disabled.
 */
export async function POST(_request: NextRequest) {
  // All user management actions are disabled in this simplified version.
  return NextResponse.json(
    {
      error: '用户管理功能已被禁用。'
    },
    { status: 400 }
  );
}
