import { NextResponse } from 'next/server';
import { isSheetsConfigured, getSpreadsheetId } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sheetId = getSpreadsheetId();
  const rawSheetId = process.env.GOOGLE_SHEET_ID;
  const rawEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const rawJsonKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  const missing: string[] = [];
  if (!rawSheetId) missing.push('GOOGLE_SHEET_ID');
  if (!rawEmail && !rawJsonKey) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!rawKey && !rawJsonKey) missing.push('GOOGLE_PRIVATE_KEY');

  return NextResponse.json({
    status: isSheetsConfigured() ? 'CONFIGURED' : 'NOT_CONFIGURED',
    timestamp: new Date().toISOString(),
    isSheetsConfigured: isSheetsConfigured(),
    missingVariables: missing,
    details: {
      GOOGLE_SHEET_ID: {
        detected: Boolean(rawSheetId),
        length: rawSheetId?.length || 0,
        cleanedLength: sheetId?.length || 0,
      },
      GOOGLE_SERVICE_ACCOUNT_EMAIL: {
        detected: Boolean(rawEmail),
        length: rawEmail?.length || 0,
      },
      GOOGLE_PRIVATE_KEY: {
        detected: Boolean(rawKey),
        length: rawKey?.length || 0,
        hasBeginHeader: Boolean(rawKey?.includes('BEGIN PRIVATE KEY')),
        hasEndHeader: Boolean(rawKey?.includes('END PRIVATE KEY')),
      },
      GOOGLE_SERVICE_ACCOUNT_KEY: {
        detected: Boolean(rawJsonKey),
      },
      TELEGRAM_BOT_TOKEN: {
        detected: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      },
    },
  });
}
