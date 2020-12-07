
import * as filestack from 'filestack-js';

import * as extractFilesFromDataTransfer from './extract_files_from_data_transfer';
import { EventEmitter } from './EventEmitter';
import { CanAcceptFileHelper } from './canAcceptFile';
import { AppConfigInterface, EventInterface } from '../interfaces';
import { UploadStatusEnum, UploadCodeEnum } from '../enum/upload';

export class Uploads {
  private uploadOptions: filestack.UploadOptions = {};
  private storeUploadOptions: filestack.StoreUploadOptions = {};
  private canAcceptFileHelper: CanAcceptFileHelper;

  constructor(private fileStack: filestack.Client, private eventEmitter: EventEmitter, private appConfig: AppConfigInterface) {
    this.canAcceptFileHelper = new CanAcceptFileHelper(eventEmitter, appConfig);
    this.assainEvents();
  }

  public setUploadOptions(uploadOptions: filestack.UploadOptions) {
    this.uploadOptions = uploadOptions;
  }

  public setStoreUploadOptions(storeUploadOptions: filestack.StoreUploadOptions) {
    this.storeUploadOptions = storeUploadOptions;
  }

  public upload(eventData: EventInterface) {
    const filestack: filestack.Client = this.fileStack;
    const token = {};

    this.eventEmitter.on('resume', id => {
      if (eventData.elementId === id) {
        token['resume']();
      }
    });
    this.eventEmitter.on('pause', id => {
      if (eventData.elementId === id) {
        token['pause']();
      }
    });
    this.eventEmitter.on('cancel', id => {
      if (eventData.elementId === id) {
        token['cancel']();
      }
    });

    if (!this.uploadOptions.onProgress) {
      this.uploadOptions.onProgress = event => {
        this.eventEmitter.emit('upload', { elementId: eventData.elementId, event, type: UploadStatusEnum.onProgress });
      };
    }
    if (!this.uploadOptions.onRetry) {
      this.uploadOptions.onRetry = () => {
        this.eventEmitter.emit('upload', { elementId: eventData.elementId, type: UploadStatusEnum.onRetry });
      };
    }

    extractFilesFromDataTransfer.default(eventData.data.dataTransfer).then((files: File[]) => {
      this.eventEmitter.emit('upload', { elementId: eventData.elementId, data: files, type: UploadStatusEnum.successReadFile });

      if (!this.checkMaxFiles(files) && !this.appConfig.uploadMaxFiles) {
        this.eventEmitter.emit('upload', <EventInterface>{ elementId: eventData.elementId, type: 'error', code: UploadCodeEnum.MAX_FILES });
        return;
      } else if (!this.checkMaxFiles(files) && this.appConfig.uploadMaxFiles) {
        this.eventEmitter.emit('upload', <EventInterface>{ elementId: eventData.elementId, type: 'info', code: UploadCodeEnum.MAX_FILES });
      }

      let acceptFiles: File[] = [];
      let errorsFiles: File[] = [];

      files.forEach(file => {
        if (this.canAcceptFileHelper.canAcceptFile(file)) {
          acceptFiles.push(file);
        } else {
          errorsFiles.push(file)
        }
      });

      if (acceptFiles.length > 0) {
        if (!this.checkMaxFiles(acceptFiles)) {
          acceptFiles.slice(0, this.appConfig.maxFiles);
        }

        filestack.multiupload(acceptFiles, this.uploadOptions, this.storeUploadOptions, token).then(files => {
          this.eventEmitter.emit('upload', <EventInterface>{ elementId: eventData.elementId, data: files, type: UploadStatusEnum.finish });
        }).catch((err) => {
          this.eventEmitter.emit('upload', <EventInterface>{ elementId: eventData.elementId, data: files, type: UploadStatusEnum.finish });
        });
      }
    });
  }

  private checkMaxFiles(files: File[]) {
    return files && files.length <= this.appConfig.maxFiles ? true : false;
  }
  private assainEvents() {
    this.eventEmitter.on('uploadFiles', (event: EventInterface) => {
      this.upload(event);
    });
  }
}
