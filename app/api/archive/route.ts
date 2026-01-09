import { NextResponse } from 'next/server';
import { archivePostgresToParquet, ArchiveResult } from '@lib/duckdb-archive';

/**
 * 1日1回のアーカイブバッチ用エンドポイント
 * POST /api/archive
 */
export async function POST() {
  try {
    // アーカイブ処理の実行
    const result: ArchiveResult = await archivePostgresToParquet();
    
    return NextResponse.json({
      ...result
    });
  } catch (error: any) {
    console.error("Archive API Route Error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || String(error) 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GETリクエストが来た場合のハンドリング（任意）
 */
export async function GET() {
  return NextResponse.json(
    { error: "Please use POST method for archiving." }, 
    { status: 405 }
  );
}