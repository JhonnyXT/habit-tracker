import type { SpreadsheetSheet } from '@/core/domain/spreadsheet';

export interface SpreadsheetFileStore {
  writeAndShare(fileName: string, sheets: SpreadsheetSheet[]): Promise<boolean>;
}
