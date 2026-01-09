//app/api/test-duckdb/route.ts
import { NextResponse } from 'next/server';
import duckdb from 'duckdb';

export async function GET() {
  try {
    const db = new duckdb.Database(':memory:'); // メモリ内で一時的に作成
    
    return new Promise((resolve) => {
      db.all('SELECT 42 as answer', (err, res) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ message: 'DuckDB 疎通成功！', data: res }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}