import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Ambil satu todo
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update todo
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, description, completed } = await request.json();

    const [result] = await pool.query(
      'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?',
      [title, description, completed, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    const [updatedTodo] = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedTodo[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Hapus todo
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    );
  }
}