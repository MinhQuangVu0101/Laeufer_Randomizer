export function getDefaultStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const probeKey = '__vb_storage_probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return localStorage;
  } catch {
    return null;
  }
}
