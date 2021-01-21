import * as filestack from 'filestack-js';

import * as extractFilesFromDataTransfer from './../utils/extract_files_from_data_transfer';
import { normalizeFile } from './../utils';
import { EventEmitter } from './eventEmitter';
import { CanAcceptFileHelper } from './canAcceptFile';
import { AppConfigInterface, EventInterface, NormalizeFileInterface } from '../interfaces';
import { UploadStatusEnum, UploadCodeEnum, UploadControllActionEnum } from '../enum/upload';

export class Uploads {
  private uploadOptions: filestack.UploadOptions = {};
  private storeUploadOptions: filestack.StoreUploadOptions = {};
  private canAcceptFileHelper: CanAcceptFileHelper;
  private security: filestack.Security;

  private arrayFilesToken = [];
  private uploadPromise = [];

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

  public setSecurity(security: filestack.Security) {
    this.security = security;
  }

  public upload(eventData: EventInterface) {
    if (eventData.data.dataTransfer) {
      extractFilesFromDataTransfer.default(eventData.data.dataTransfer).then((files: File[]) => {
        this.uploadFiles(files, eventData);
      });
    }
  }

  private uploadFiles(eventFiles: File[], eventData: EventInterface) {
    const sdk: filestack.Client = this.sdk;
    const files: NormalizeFileInterface[] = [];

    eventFiles.forEach(file => {
      files.push(normalizeFile(file));
    });

    if (!this.checkMaxFiles(files) && this.appConfig.failOverMaxFiles) {
      this.eventEmitter.emit(UploadStatusEnum.error, { elementId: eventData.elementId, code: UploadCodeEnum.MAX_FILES } as EventInterface);
      return;
    } else if (!this.checkMaxFiles(files) && !this.appConfig.failOverMaxFiles) {
      this.eventEmitter.emit(UploadStatusEnum.error, { elementId: eventData.elementId, code: UploadCodeEnum.MAX_FILES } as EventInterface);
    }

    let acceptFiles: NormalizeFileInterface[] = [];

    files.forEach((file: NormalizeFileInterface) => {
      if (this.canAcceptFileHelper.canAcceptFile(file.originalFile)) {
        acceptFiles.push(file);
      }
    });

    this.eventEmitter.emit(UploadStatusEnum.successReadFile, { elementId: eventData.elementId, files: acceptFiles, url: eventData.data.dataTransfer.getData('text/html') });

    if (acceptFiles.length > 0) {
      if (!this.checkMaxFiles(acceptFiles)) {
        const errorsFiles = acceptFiles.slice(this.appConfig.maxFiles, acceptFiles.length - 1);
        acceptFiles = acceptFiles.slice(0, this.appConfig.maxFiles);

        this.eventEmitter.emit(UploadStatusEnum.error, { elementId: eventData.elementId, data: errorsFiles });
      }

      acceptFiles.forEach((item: NormalizeFileInterface) => {
        const token = {};
        this.assainUploadEvents(eventData, token);

        const cloneUploadOptions = { ...this.uploadOptions };
        this.assainUploadCallbacks(cloneUploadOptions, eventData, [item]);

        this.arrayFilesToken.push({ elementId: eventData.elementId, uploadId: item.uploadId, token });

        const uploadPromise = sdk
          .upload(item.originalFile, cloneUploadOptions, this.storeUploadOptions, token, this.security)
          .then(res => {
            this.eventEmitter.emit(UploadStatusEnum.uploadFileFinish, { elementId: eventData.elementId, files: [item], data: res } as EventInterface);

            return res;
          })
          .catch(err => {
            this.eventEmitter.emit(UploadStatusEnum.error, { elementId: eventData.elementId, files: [item], error: err } as EventInterface);

            return err;
          });

          this.uploadPromise.push(uploadPromise);
      });

      Promise.all(this.uploadPromise).then((values) => {
        this.eventEmitter.emit(UploadStatusEnum.finish, { elementId: eventData.elementId, files } as EventInterface);
      });
    }
  }

  private checkMaxFiles(files: NormalizeFileInterface[]) {
    return this.appConfig.maxFiles === 0 || files.length <= this.appConfig.maxFiles ? true : false;
  }

  private assainUploadCallbacks(uploadOptions: filestack.ClientOptions, eventData, files) {
    uploadOptions.onProgress = event => {
      if (this.uploadOptions.onProgress) {
        this.uploadOptions.onProgress(event);
      }
      this.eventEmitter.emit(UploadStatusEnum.progress, { elementId: eventData.elementId, data: event, files } as EventInterface);
    };
    uploadOptions.onRetry = () => {
      if (this.uploadOptions.onRetry) {
        this.uploadOptions.onRetry();
      }
      this.eventEmitter.emit(UploadStatusEnum.retry, { elementId: eventData.elementId, files } as EventInterface);
    };
  }

  private assainUploadEvents(eventData, token) {
    this.eventEmitter.on(UploadControllActionEnum.RESUME, (elementId: string, uploadId: string) => {
      this.uploadEventControl(elementId, uploadId, UploadControllActionEnum.RESUME);
    });
    this.eventEmitter.on(UploadControllActionEnum.PAUSE, (elementId: string, uploadId: string) => {
      this.uploadEventControl(elementId, uploadId, UploadControllActionEnum.PAUSE);
    });
    this.eventEmitter.on(UploadControllActionEnum.CANCEL, (elementId: string, uploadId: string) => {
      this.uploadEventControl(elementId, uploadId, UploadControllActionEnum.CANCEL);
    });
  }

  private uploadEventControl(elementId: string, uploadId: string, type: UploadControllActionEnum) {
    if (!elementId && !uploadId) {
      return false;
    }

    if (elementId && !uploadId) {
      if (this.arrayFilesToken.length > 0) {
        this.arrayFilesToken.forEach(filesToken => {
          if (filesToken.elementId === elementId) {
            this.executeToken(type, filesToken.token);
          }
        });
      }
    }

    if (!uploadId) {
      if (this.arrayFilesToken.length > 0) {
        this.arrayFilesToken.forEach(filesToken => {
          if (filesToken.uploadId === uploadId) {
            this.executeToken(type, filesToken.token);
          }
        });
      }
    }
  }

  private executeToken(type: UploadControllActionEnum, token) {
    switch (type) {
      case UploadControllActionEnum.PAUSE:
        token.resume();
        break;
      case UploadControllActionEnum.RESUME:
        token.resume();
        break;
      case UploadControllActionEnum.CANCEL:
        token.cancel();
        break;
    }
  }

  private assainEvents() {
    this.eventEmitter.on('uploadFiles', (event: EventInterface) => {
      this.upload(event);
    });
  }
}
