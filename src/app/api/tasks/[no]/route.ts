import { NextRequest, NextResponse } from 'next/server';
import { deleteTask, getTaskByNo, toggleTaskStatus, updateTask } from '@/lib/sheets';
import { UpdateTaskInput } from '@/types/task';

interface RouteContext {
  params: Promise<{ no: string }>;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { no: noParam } = await context.params;
    const no = parseInt(noParam, 10);
    if (isNaN(no)) {
      return NextResponse.json({ success: false, error: 'Nomor tugas tidak valid.' }, { status: 400 });
    }

    const task = await getTaskByNo(no);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('API GET /api/tasks/[no] error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil detail tugas.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { no: noParam } = await context.params;
    const no = parseInt(noParam, 10);
    if (isNaN(no)) {
      return NextResponse.json({ success: false, error: 'Nomor tugas tidak valid.' }, { status: 400 });
    }

    const body = (await req.json()) as UpdateTaskInput;
    if (body.deadline) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.deadline) || isNaN(Date.parse(body.deadline))) {
        return NextResponse.json(
          { success: false, error: 'Format tanggal harus YYYY-MM-DD yang valid.' },
          { status: 400 }
        );
      }
    }

    const updated = await updateTask(no, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PUT /api/tasks/[no] error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui tugas.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { no: noParam } = await context.params;
    const no = parseInt(noParam, 10);
    if (isNaN(no)) {
      return NextResponse.json({ success: false, error: 'Nomor tugas tidak valid.' }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as { action?: string } & UpdateTaskInput;

    if (body.action === 'toggle-status') {
      const toggled = await toggleTaskStatus(no);
      if (!toggled) {
        return NextResponse.json({ success: false, error: 'Tugas tidak ditemukan.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: toggled });
    }

    const updated = await updateTask(no, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API PATCH /api/tasks/[no] error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengubah status tugas.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { no: noParam } = await context.params;
    const no = parseInt(noParam, 10);
    if (isNaN(no)) {
      return NextResponse.json({ success: false, error: 'Nomor tugas tidak valid.' }, { status: 400 });
    }

    const deleted = await deleteTask(no);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Tugas tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Tugas #${no} berhasil dihapus.` });
  } catch (error) {
    console.error('API DELETE /api/tasks/[no] error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus tugas.' }, { status: 500 });
  }
}
