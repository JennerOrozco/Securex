export function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(fileOrName: File | string): string {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName?.name;
  const ext = (name || '').split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'pi pi-file-pdf';
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'svg': return 'pi pi-image';
    case 'doc': case 'docx': return 'pi pi-file-word';
    case 'xls': case 'xlsx': return 'pi pi-file-excel';
    default: return 'pi pi-file';
  }
}

export function getFileIconClass(fileOrName: File | string): string {
  const name = typeof fileOrName === 'string' ? fileOrName : fileOrName?.name;
  const ext = (name || '').split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'icon-pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'icon-img';
  if (['doc', 'docx'].includes(ext || '')) return 'icon-doc';
  if (['xls', 'xlsx'].includes(ext || '')) return 'icon-xls';
  return 'icon-default';
}
