const extensions = ['zip', 'tgz', 'gz', 'tar'];

export function isCompressed(ext) {
  ext = ext.replace(/^\./, '');
  return extensions.indexOf(ext) > -1;
}
