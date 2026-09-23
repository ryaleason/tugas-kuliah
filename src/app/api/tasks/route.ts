import { NextRequest, NextResponse } from 'next/server';
import { createTask, getTasks, isSheetsConfigured } from '@/lib/sheets';
import { CreateTaskInput } from '@/types/task';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json({
      success: true,
      data: tasks,
      isConfigured: isSheetsConfigured(),
    });
  } catch (error) {
    console.error('API GET /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data tugas dari spreadsheet.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTaskInput;

    if (!body.matkul || !body.tugas || !body.deadline) {
      return NextResponse.json(
        { success: false, error: 'Matkul, Tugas, dan Deadline wajib diisi.' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.deadline) || isNaN(Date.parse(body.deadline))) {
      return NextResponse.json(
        { success: false, error: 'Format tanggal harus YYYY-MM-DD yang valid.' },
        { status: 400 }
      );
    }

    const created = await createTask({
      matkul: body.matkul,
      tugas: body.tugas,
      deadline: body.deadline,
      keterangan: body.keterangan || '',
      status: body.status || 'Belum Selesai',
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat tugas baru.' },
      { status: 500 }
    );
  }
}
