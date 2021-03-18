import { guid } from './guid';

/**
 * Return a normalized file size as number or null if conditions are not fullfilled
 * @param {object} file
 * @returns {number|null}
 */
function normalizeFileSize(file) {
  let normalizedFileSize = null;
  if (file.size) {
    if (typeof file.size === 'number') {
      normalizedFileSize = file.size;
    } else if (typeof file.size === 'string' && file.size === parseInt(file.size, 10).toString()) {
      // convert when it's "200", but not when it's "200x250" (eg. facebook, instagram)
      normalizedFileSize = parseInt(file.size, 10);
    }
  }
  return normalizedFileSize;
};

/**
 * Return a normalized file object from different sources
 * @param {object} file - file object to be normalized
 * @param {object} cloudParams
 * @param {object} cloudParams.currentCloud - settings of currently selected cloud provider
 * @param {object} cloudParams.cloudFolders - list of all folders of the selected cloud
 * @param {object} cloudParams.selectedCloudPath - path to the selected folder
 * @returns {object}
 */
export function normalizeFile(file) {
  if (file instanceof File) {
    file = {
      source: 'local_file_system',
      mimetype: file.type,
      name: file.name,
      path: file.name,
      size: file.size,
      originalFile: file,
    };
  }

  if (file.source === 'dragged-from-web') {
    file.name = file.url.split('/').pop();
    file.path = file.url;
    file.mimetype = 'text/html';

    const ext = file.url.split('.').pop();
    const allowed = ['jpg', 'jpeg', 'png', 'tiff', 'gif', 'bmp'];
    if (ext && allowed.indexOf(ext.toLowerCase()) !== -1) {
      file.thumbnail = file.url;
      file.mimetype = `image/${ext}`;
    }
  }

  // link_path exists on responses from cloud().metadata(...)
  if (file.link_path) {
    file.source = 'url';
    file.path = file.link_path;
    file.mimetype = file.type;
  }

  file.uuid = guid(16);
  file.uploadId = file.uuid;
  file.progress = 0;
  file.progressSize = '';
  file.size = normalizeFileSize(file);

  return file;
};
