import { google, sheets_v4 } from 'googleapis';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task';

const HEADERS = ['No', 'Matkul', 'Tugas', 'Deadline', 'Keterangan Tambahan', 'Status'];

// In-memory fallback mock storage when credentials are not yet configured
let mockTasks: Task[] = [
  {
    no: 1,
    matkul: 'Pemrograman Web',
    tugas: 'Implementasi API & Frontend Next.js',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    keterangan: 'Gunakan Tailwind CSS & Google Sheets',
    status: 'Belum Selesai',
    rowIndex: 2,
  },
  {
    no: 2,
    matkul: 'Basis Data Lanjut',
    tugas: 'Laporan Normalisasi Database & Indexing',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    keterangan: 'Kumpulkan dalam format PDF di portal kampus',
    status: 'Belum Selesai',
    rowIndex: 3,
  },
];

function cleanString(val?: string | null): string {
  if (!val) return '';
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

function cleanPrivateKey(key?: string | null): string {
  if (!key) return '';
  let cleaned = cleanString(key);
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\r/g, '');
  return cleaned.trim();
}

export function getSpreadsheetId(): string {
  return cleanString(process.env.GOOGLE_SHEET_ID);
}

function getCredentials() {
  const jsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (jsonKey) {
    try {
      const parsed = typeof jsonKey === 'string' ? JSON.parse(jsonKey) : jsonKey;
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: cleanString(parsed.client_email),
          private_key: cleanPrivateKey(parsed.private_key),
        };
      }
    } catch {
      console.warn('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON');
    }
  }

  const client_email = cleanString(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const private_key = cleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  if (client_email && private_key) {
    return { client_email, private_key };
  }

  return null;
}

export function isSheetsConfigured(): boolean {
  const sheetId = getSpreadsheetId();
  const creds = getCredentials();
  return Boolean(sheetId && creds && !sheetId.includes('your_google_sheet_id'));
}

let sheetsClientInstance: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets | null {
  if (sheetsClientInstance) return sheetsClientInstance;

  const creds = getCredentials();
  if (!creds) return null;

  try {
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClientInstance = google.sheets({ version: 'v4', auth });
    return sheetsClientInstance;
  } catch (err) {
    console.error('Error creating Google Sheets client:', err);
    return null;
  }
}

interface SheetLayout {
  sheetTitle: string;
  headerRow: number; // 1-indexed
  colOffset: number; // 0 for A, 1 for B, etc.
  startCol: string; // 'A', 'B'
  endCol: string; // 'F', 'G'
  numericSheetId: number;
}

let cachedLayout: SheetLayout | null = null;

async function detectSheetLayout(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<SheetLayout> {
  if (cachedLayout) return cachedLayout;

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const allSheets = meta.data.sheets || [];

  // Look for a tab named 'tugas' or use the first tab
  const targetSheet =
    allSheets.find((s) => s.properties?.title?.toLowerCase() === 'tugas') ||
    allSheets[0];

  const sheetTitle = targetSheet?.properties?.title || 'Sheet1';
  const numericSheetId = targetSheet?.properties?.sheetId || 0;

  // Read top 15 rows to find header row containing 'No' and 'Matkul'
  const preview = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A1:Z15`,
  });

  const rows = preview.data.values || [];
  let headerRow = -1;
  let colOffset = 0;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').trim().toLowerCase();
      const nextCell = String(row[c + 1] || '').trim().toLowerCase();
      if (cell === 'no' && nextCell.includes('matkul')) {
        headerRow = r + 1; // 1-indexed
        colOffset = c;
        break;
      }
    }
    if (headerRow !== -1) break;
  }

  // Fallback if no header found
  if (headerRow === -1) {
    headerRow = 1;
    colOffset = 0;
    // Try to ensure header at A1
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetTitle}'!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [HEADERS] },
      });
    } catch (e) {
      console.warn('Could not write fallback header:', e);
    }
  }

  const startCol = String.fromCharCode(65 + colOffset);
  const endCol = String.fromCharCode(65 + colOffset + 5);

  cachedLayout = {
    sheetTitle,
    headerRow,
    colOffset,
    startCol,
    endCol,
    numericSheetId,
  };

  return cachedLayout;
}

export async function getTasks(): Promise<Task[]> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  if (!sheets || !spreadsheetId || !isSheetsConfigured()) {
    return [...mockTasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
  }

  try {
    const layout = await detectSheetLayout(sheets, spreadsheetId);
    const range = `'${layout.sheetTitle}'!${layout.startCol}${layout.headerRow + 1}:${layout.endCol}`;

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = res.data.values || [];
    const tasks: Task[] = [];

    rows.forEach((row, index) => {
      if (!row || row.length === 0) return;

      const no = Number(row[0]) || index + 1;
      const matkul = (row[1] || '').toString().trim();
      const tugas = (row[2] || '').toString().trim();
      const deadline = (row[3] || '').toString().trim();
      const keterangan = (row[4] || '').toString().trim();
      const statusRaw = (row[5] || '').toString().trim();
      const status: TaskStatus = statusRaw === 'Selesai' ? 'Selesai' : 'Belum Selesai';

      // Only count as task if matkul or tugas is filled
      if (!matkul && !tugas) return;

      tasks.push({
        no,
        matkul,
        tugas,
        deadline,
        keterangan,
        status,
        rowIndex: layout.headerRow + 1 + index,
      });
    });

    return tasks.sort((a, b) => a.deadline.localeCompare(b.deadline));
  } catch (err) {
    console.error('Error fetching tasks from Google Sheets:', err);
    throw err;
  }
}

export async function getTaskByNo(no: number): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find((t) => t.no === no) || null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  if (!sheets || !spreadsheetId || !isSheetsConfigured()) {
    const nextNo = mockTasks.length > 0 ? Math.max(...mockTasks.map((t) => t.no)) + 1 : 1;
    const newTask: Task = {
      no: nextNo,
      matkul: input.matkul,
      tugas: input.tugas,
      deadline: input.deadline,
      keterangan: input.keterangan || '',
      status: input.status || 'Belum Selesai',
      rowIndex: mockTasks.length + 2,
    };
    mockTasks.push(newTask);
    return newTask;
  }

  const layout = await detectSheetLayout(sheets, spreadsheetId);
  const tasks = await getTasks();
  const nextNo = tasks.length > 0 ? Math.max(...tasks.map((t) => t.no)) + 1 : 1;

  // Check if sheet has pre-numbered rows where No matches nextNo and task is empty
  const range = `'${layout.sheetTitle}'!${layout.startCol}${layout.headerRow + 1}:${layout.endCol}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rawRows = res.data.values || [];

  let targetRowIndex = -1;
  for (let i = 0; i < rawRows.length; i++) {
    const r = rawRows[i];
    const rowNo = Number(r[0]);
    const matkul = (r[1] || '').toString().trim();
    const tugas = (r[2] || '').toString().trim();

    if (rowNo === nextNo && !matkul && !tugas) {
      targetRowIndex = layout.headerRow + 1 + i;
      break;
    }
  }

  const rowValues = [
    nextNo,
    input.matkul.trim(),
    input.tugas.trim(),
    input.deadline.trim(),
    (input.keterangan || '').trim(),
    input.status || 'Belum Selesai',
  ];

  if (targetRowIndex !== -1) {
    // Overwrite the placeholder row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${layout.sheetTitle}'!${layout.startCol}${targetRowIndex}:${layout.endCol}${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] },
    });
  } else {
    // Append a new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${layout.sheetTitle}'!${layout.startCol}:${layout.endCol}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowValues] },
    });
  }

  return {
    no: nextNo,
    matkul: input.matkul,
    tugas: input.tugas,
    deadline: input.deadline,
    keterangan: input.keterangan || '',
    status: input.status || 'Belum Selesai',
  };
}

export async function updateTask(no: number, input: UpdateTaskInput): Promise<Task | null> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  if (!sheets || !spreadsheetId || !isSheetsConfigured()) {
    const index = mockTasks.findIndex((t) => t.no === no);
    if (index === -1) return null;
    const existing = mockTasks[index];
    const updated: Task = {
      ...existing,
      matkul: input.matkul ?? existing.matkul,
      tugas: input.tugas ?? existing.tugas,
      deadline: input.deadline ?? existing.deadline,
      keterangan: input.keterangan ?? existing.keterangan,
      status: input.status ?? existing.status,
    };
    mockTasks[index] = updated;
    return updated;
  }

  const layout = await detectSheetLayout(sheets, spreadsheetId);
  const tasks = await getTasks();
  const target = tasks.find((t) => t.no === no);
  if (!target || !target.rowIndex) return null;

  const updated: Task = {
    ...target,
    matkul: input.matkul ?? target.matkul,
    tugas: input.tugas ?? target.tugas,
    deadline: input.deadline ?? target.deadline,
    keterangan: input.keterangan ?? target.keterangan,
    status: input.status ?? target.status,
  };

  const rowValues = [
    updated.no,
    updated.matkul,
    updated.tugas,
    updated.deadline,
    updated.keterangan,
    updated.status,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${layout.sheetTitle}'!${layout.startCol}${target.rowIndex}:${layout.endCol}${target.rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowValues] },
  });

  return updated;
}

export async function toggleTaskStatus(no: number): Promise<Task | null> {
  const task = await getTaskByNo(no);
  if (!task) return null;
  const newStatus: TaskStatus = task.status === 'Selesai' ? 'Belum Selesai' : 'Selesai';
  return updateTask(no, { status: newStatus });
}

export async function deleteTask(no: number): Promise<boolean> {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  if (!sheets || !spreadsheetId || !isSheetsConfigured()) {
    const prevLen = mockTasks.length;
    mockTasks = mockTasks.filter((t) => t.no !== no);
    return mockTasks.length < prevLen;
  }

  const layout = await detectSheetLayout(sheets, spreadsheetId);
  const tasks = await getTasks();
  const target = tasks.find((t) => t.no === no);
  if (!target || !target.rowIndex) return false;

  // Clear task columns but keep No if inside pre-formatted table, or clear row
  const clearRange = `'${layout.sheetTitle}'!${String.fromCharCode(65 + layout.colOffset + 1)}${target.rowIndex}:${layout.endCol}${target.rowIndex}`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: clearRange,
  });

  return true;
}
