import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleOptionsResponse, jsonResponse } from '@/lib/api-utils';

export async function OPTIONS() {
  return handleOptionsResponse(['GET', 'HEAD', 'OPTIONS']);
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
}

export async function GET() {
  let storageStatus = 'healthy';
  let storageMode = 'local';

  // Check local filesystem write availability
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.resolve(dataDir, '.health_check');
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
  } catch (err) {
    storageStatus = 'degraded_filesystem';
  }

  // Check Supabase configuration presence
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    storageMode = 'hybrid_supabase_local';
  }

  return jsonResponse({
    status: 'ok',
    service: 'AlgoPulse Dashboard API',
    version: '1.2.0',
    storage: {
      status: storageStatus,
      mode: storageMode
    },
    timestamp: new Date().toISOString()
  });
}
