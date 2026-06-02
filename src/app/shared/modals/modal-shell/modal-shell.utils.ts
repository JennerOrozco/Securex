export function getFileIcon(file: File): string {
  if (!file) return 'pi pi-file';
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'pi pi-file-pdf';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return 'pi pi-image';
    case 'doc': case 'docx': return 'pi pi-file-word';
    case 'xls': case 'xlsx': return 'pi pi-file-excel';
    default: return 'pi pi-file';
  }
}

export function getFileIconClass(file: File): string {
  if (!file) return 'default';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
  if (['doc', 'docx'].includes(ext || '')) return 'doc';
  if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
  return 'default';
}

export function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
