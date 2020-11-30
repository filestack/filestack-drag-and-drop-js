import * as extractFilesFromDataTransfer from './extract_files_from_data_transfer';
import * as filestack from 'filestack-js';

import { EventEmitter } from './EventEmitter';
import { EventInterfaces } from './../interfaces/eventInterface';

export class Uploads {
  private uploadOptions: filestack.UploadOptions = {};
  private storeUploadOptions: filestack.StoreUploadOptions = {};

  constructor(private fileStack: filestack.Client, private eventEmitter: EventEmitter) {
    this.assainEvents();
  }

  public setUploadOptions(uploadOptions: filestack.UploadOptions) {
    this.uploadOptions = uploadOptions;
  }

  public setStoreUploadOptions(storeUploadOptions: filestack.StoreUploadOptions) {
    this.storeUploadOptions = storeUploadOptions;
  }

  public upload(data: EventInterfaces) {
    const filestack: filestack.Client = this.fileStack;
    const token = {};

    this.eventEmitter.on('resume', id => {
      if (data.id === id) {
        token['resume']();
      }
    });
    this.eventEmitter.on('pause', id => {
      if (data.id === id) {
        token['pause']();
      }
    });
    this.eventEmitter.on('cancel', id => {
      if (data.id === id) {
        token['cancel']();
      }
    });

    if (!this.uploadOptions.onProgress) {
      this.uploadOptions.onProgress = event => {
        this.eventEmitter.emit('upload.onProgress', { id: data.id, event });
      };
    }
    if (!this.uploadOptions.onRetry) {
      this.uploadOptions.onRetry = () => {
        this.eventEmitter.emit('upload.onRetry', { id: data.id, event: null });
      };
    }

    extractFilesFromDataTransfer.default(data.event.dataTransfer).then((files: File[]) => {
      this.eventEmitter.emit('upload.successReadFile', { id: data.id, data: files });

      filestack.multiupload(files, this.uploadOptions, this.storeUploadOptions, token).then(files => {
        this.eventEmitter.emit('upload.finish', { id: data.id, data: files });
      });
    });
  }

  private assainEvents() {
    this.eventEmitter.on('upload', (event: EventInterfaces) => {
      this.upload(event);
    });
  }
}
