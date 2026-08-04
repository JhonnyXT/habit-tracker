export interface BackupFileStore {
  writeAndShare(fileName: string, contents: string): Promise<boolean>;
  pickAndRead(): Promise<string | null>;
}
