// Takes: https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
// Returns: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
const getFileEntryFromDataTransferItem = (file) => {
  if (typeof file.getAsEntry === 'function') {
    return file.getAsEntry();
  } else if (typeof file.webkitGetAsEntry === 'function') {
    return file.webkitGetAsEntry();
  }
  return undefined;
};

const isWantedFile = (filename) => {
  const unwantedFiles = [
    // Stores thumbnails on OSX
    '.DS_Store',
  ];
  return unwantedFiles.indexOf(filename) === -1;
};

const getPath = (path, name) => {
  return `${path}/${name}`;
};

const extractFromItems = (items) => {
  const files = [];

  const traverseDirectoryTree = (fileEntry, path = '') => {
    const promises = [];

    return new Promise((resolve) => {
      if (fileEntry.isDirectory) {
        const reader = fileEntry.createReader();

        const readFiles = () => {
          reader.readEntries((dirContent) => {
            dirContent.forEach((dirItem) => {
              promises.push(traverseDirectoryTree(dirItem, getPath(path, fileEntry.name)));
            });

            if (dirContent.length) {
              readFiles();
            } else {
              Promise.all(promises).then(resolve);
            }
          });
        };

        readFiles();
      } else if (fileEntry.isFile) {
        fileEntry.file((file) => {
          if (isWantedFile(file.name)) {
            file.path = getPath(path, file.name);
            files.push(file);
          }
          resolve();
        });
      }
    });
  };

  const extractUrl = (item) => {
    return new Promise((resolve) => {
      item.getAsString((url) => {
        files.push({ url, source: 'dragged-from-web' });
        resolve();
      });
    });
  };

  const promises = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.kind === 'file' && item.type && item.type !== 'application/x-moz-file') {
      const file = item.getAsFile();
      if (file) {
        // It is a simple file
        files.push(file);
        promises.push(Promise.resolve());
      }
    } else if (item.kind === 'file') {
      // It's not a simple file, possibly folder, try to scout its content.
      const file = getFileEntryFromDataTransferItem(item);
      if (file) {
        promises.push(traverseDirectoryTree(file));
      }
    } else if (item.kind === 'string' && item.type === 'text/uri-list') {
      promises.push(extractUrl(item));
    }
  }

  return Promise.all(promises).then(() => {
    return files;
  });
};

const extractFromFiles = (fileList) => {
  return new Promise((resolve) => {
    const files = [];
    for (let i = 0; i < fileList.length; i += 1) {
      files.push(fileList[i]);
    }
    resolve(files);
  });
};

// Takses: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
// Returns Array of possible file representations:
// 1. File class instance - https://developer.mozilla.org/en-US/docs/Web/API/File
// 2. Blob class instance - https://developer.mozilla.org/en-US/docs/Web/API/Blob
// 3. Object with url to resource - { url: 'https://files.com/file.jpg' }
export default (dataTransfer) => {
  // if there is no dataTransfer object, just return empty promise
  if (!dataTransfer) {
    return Promise.resolve([]);
  }

  if (dataTransfer.items) {
    return extractFromItems(dataTransfer.items);
  }

  if (dataTransfer.files) {
    return extractFromFiles(dataTransfer.files);
  }

  // Safety fallback if this dataTransfer has nothing we can make sense of.
  return Promise.resolve([]);
};
