import * as filestack from 'filestack-js';

import * as extractFilesFromDataTransfer from './extract_files_from_data_transfer';
import { EventEmitter } from './eventEmitter';
import { CanAcceptFileHelper } from './canAcceptFile';
import { AppConfigInterface, EventInterface } from '../interfaces';
import { UploadStatusEnum, UploadCodeEnum } from '../enum/upload';

export class Uploads {
  private uploadOptions: filestack.UploadOptions = {};
  private storeUploadOptions: filestack.StoreUploadOptions = {};
  private canAcceptFileHelper: CanAcceptFileHelper;

  constructor(private sdk: filestack.Client, private eventEmitter: EventEmitter, private appConfig: AppConfigInterface) {
    this.canAcceptFileHelper = new CanAcceptFileHelper(eventEmitter, appConfig, sdk);
    this.assainEvents();
  }

  public setUploadOptions(uploadOptions: filestack.UploadOptions) {
    this.uploadOptions = uploadOptions;
  }

  public setStoreUploadOptions(storeUploadOptions: filestack.StoreUploadOptions) {
    this.storeUploadOptions = storeUploadOptions;
  }

  public upload(eventData: EventInterface) {
    const sdk: filestack.Client = this.sdk;
    const token = {};

    this.assainUploadEvents(eventData, token);

    extractFilesFromDataTransfer.default(eventData.data.dataTransfer).then((files: File[]) => {
      this.eventEmitter.emit(UploadStatusEnum.successReadFile, { elementId: eventData.elementId, data: files });

      if (!this.checkMaxFiles(files) && !this.appConfig.uploadMaxFiles) {
        this.eventEmitter.emit(UploadStatusEnum.error, <EventInterface>{ elementId: eventData.elementId, code: UploadCodeEnum.MAX_FILES });
        return;
      } else if (!this.checkMaxFiles(files) && this.appConfig.uploadMaxFiles) {
        this.eventEmitter.emit(UploadStatusEnum.error, <EventInterface>{ elementId: eventData.elementId, code: UploadCodeEnum.MAX_FILES });
      }

      let acceptFiles: File[] = [];

      files.forEach(file => {
        if (this.canAcceptFileHelper.canAcceptFile(file)) {
          acceptFiles.push(file);
        }
      });

      if (acceptFiles.length > 0) {
        if (!this.checkMaxFiles(acceptFiles)) {
          acceptFiles = acceptFiles.slice(0, this.appConfig.maxFiles);
        }

        const cloneUploadOptions = { ...this.uploadOptions };
        this.assainUploadCallbacks(cloneUploadOptions, eventData);

        sdk
          .multiupload(acceptFiles, cloneUploadOptions, this.storeUploadOptions, token)
          .then(files => {
            this.eventEmitter.emit(UploadStatusEnum.finish, <EventInterface>{ elementId: eventData.elementId, data: files });
          })
          .catch(err => {
            this.eventEmitter.emit(UploadStatusEnum.error, <EventInterface>{ elementId: eventData.elementId, data: files });
          });
      }
    });
  }

  private checkMaxFiles(files: File[]) {
    return this.appConfig.maxFiles === 0 || files.length <= this.appConfig.maxFiles ? true : false;
  }

  private assainUploadCallbacks(cloneUploadOptions: filestack.ClientOptions, eventData) {
    cloneUploadOptions.onProgress = event => {
      if (this.uploadOptions.onProgress) {
        this.uploadOptions.onProgress(event);
      }
      this.eventEmitter.emit(UploadStatusEnum.progress, { elementId: eventData.elementId, event });
    };
    cloneUploadOptions.onRetry = () => {
      if (this.uploadOptions.onRetry) {
        this.uploadOptions.onRetry();
      }
      this.eventEmitter.emit(UploadStatusEnum.retry, { elementId: eventData.elementId });
    };
  }

  private assainUploadEvents(eventData, token) {
    this.eventEmitter.on('resume', id => {
      if (eventData.elementId === id) {
        token.resume();
      }
    });
    this.eventEmitter.on('pause', id => {
      if (eventData.elementId === id) {
        token.pause();
      }
    });
    this.eventEmitter.on('cancel', id => {
      if (eventData.elementId === id) {
        token.cancel();
      }
    });
  }

  private assainEvents() {
    this.eventEmitter.on('uploadFiles', (event: EventInterface) => {
      this.upload(event);
    });
  }
}
