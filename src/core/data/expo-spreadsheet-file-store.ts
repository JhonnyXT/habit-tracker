import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import type { SpreadsheetFileStore } from '@/core/domain/spreadsheet-file-store';
import type { SpreadsheetSheet } from '@/core/domain/spreadsheet';

export class ExpoSpreadsheetFileStore implements SpreadsheetFileStore {
  async writeAndShare(fileName: string, sheets: SpreadsheetSheet[]): Promise<boolean> {
    if (!(await Sharing.isAvailableAsync())) return false;

    const workbook = XLSX.utils.book_new();
    for (const sheet of sheets) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet.rows), sheet.name);
    }
    const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;

    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(base64, { encoding: 'base64' });

    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
      dialogTitle: fileName,
    });

    return true;
  }
}
