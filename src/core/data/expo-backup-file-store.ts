import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

import type { BackupFileStore } from '@/core/domain/backup-file-store';

export class ExpoBackupFileStore implements BackupFileStore {
  async writeAndShare(fileName: string, contents: string): Promise<boolean> {
    if (!(await Sharing.isAvailableAsync())) return false;

    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(contents);

    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: fileName,
    });

    return true;
  }

  async pickAndRead(): Promise<string | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    if (!asset) return null;

    return new File(asset.uri).text();
  }
}
