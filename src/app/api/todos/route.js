import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Ambil semua todos
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Buat todo baru
export async function POST(request) {
  try {
    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description || '']
    );

    const [newTodo] = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}