function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^$(){}|[\]\\]/g, '\\$&')
    .replaceAll('**', '§§')
    .replaceAll('*', '[^/]*')
    .replaceAll('§§', '.*')
    .replaceAll('?', '.');

  return new RegExp('^' + escaped + '$');
}

export function criterionImpacted(criterion, files) {
  const patterns = criterion.files || [];
  if (!patterns.length) return true;
  return files.some((file) => patterns.some((p) => globToRegex(p).test(file)));
}
