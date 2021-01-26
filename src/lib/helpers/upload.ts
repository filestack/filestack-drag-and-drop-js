import * as filestack from 'filestack-js';

import * as extractFilesFromDataTransfer from './../utils/extract_files_from_data_transfer';
import { normalizeFile } from './../utils';
import { EventEmitter } from './eventEmitter';
import { CanAcceptFileHelper } from './canAcceptFile';
import { OptionsInterface, EventInterface, NormalizeFileInterface } from '../interfaces';
import { UploadStatusEnum, UploadCodeEnum, UploadControllActionEnum } from '../enum/upload';

/**
 * Upload files
 */
export class Uploads {
  private uploadOptions: filestack.UploadOptions = {};
  private storeUploadOptions: filestack.StoreUploadOptions = {};
  private canAcceptFileHelper: CanAcceptFileHelper;
  private security: filestack.Security;

  private arrayFilesToken = [];
  private uploadPromise = [];

  /**
   * Constructor
   *
   * @param {object} sdk
   * @param {EventEmitter} eventEmitter
   * @param {OptionsInterface} options
   * @returns {void}
   * @memberof Uploads
   */
  constructor(private sdk: filestack.Client, private eventEmitter: EventEmitter, private options: OptionsInterface) {
    this.canAcceptFileHelper = new CanAcceptFileHelper(eventEmitter, options, sdk);
    this.assainEvents();
  }

  /**
   * Set Upload Options
   *
   * @param {object} uploadOptions
   * @returns {void}
   * @memberof Uploads
   */
  public setUploadOptions(uploadOptions: filestack.UploadOptions) {
    this.uploadOptions = uploadOptions;
  }

  /**
   * Set Store Upload Options
   *
   * @param {object} storeUploadOptions
   * @returns {void}
   * @memberof Uploads
   */
  public setStoreUploadOptions(storeUploadOptions: filestack.StoreUploadOptions) {
    this.storeUploadOptions = storeUploadOptions;
  }

  /**
   * Set Security Options
   *
   * @param {object} security
   * @returns {void}
   * @memberof Uploads
   */
  public setSecurity(security: filestack.Security) {
    this.security = security;
  }

  /**
   * Upload
   *
   * @param {EventInterface} eventData
   * @returns {void}
   * @memberof Uploads
   */
  public upload(eventData: EventInterface) {
    if (eventData.data.dataTransfer) {
      extractFilesFromDataTransfer.default(eventData.data.dataTransfer).then((files: File[]) => {
        this.uploadFiles(files, eventData);
      });
    }
  }


  /**
   * Upload Files
   *
   * @param {File[]} eventFiles
   * @param {EventInterface} eventData
   * @returns {void}
   * @memberof Uploads
   */
  private uploadFiles(eventFiles: File[], eventData: EventInterface) {
    const sdk: filestack.Client = this.sdk;
    const files: NormalizeFileInterface[] = [];

    eventFiles.forEach(file => {
      files.push(normalizeFile(file));
    });

    if (!this.checkMaxFiles(files) && this.options.failOverMaxFiles) {
      console.log(3);
      this.eventEmitter.emit(UploadStatusEnum.error, { elementId: eventData.elementId, code: UploadCodeEnum.MAX_FILES } as EventInterface);
      return;
    } else if (!this.checkMaxFiles(files) && !this.options.failOverMaxFiles) {
      console.log(4);
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
        const errorsFiles = acceptFiles.slice(this.options.maxFiles, acceptFiles.length - 1);
        acceptFiles = acceptFiles.slice(0, this.options.maxFiles);

        console.log(5);
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
            console.log(6);
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

  /**
   * Max Files
   *
   * @param {NormalizeFileInterface[]} files
   * @returns {boolean}
   * @memberof Uploads
   */
  private checkMaxFiles(files: NormalizeFileInterface[]) {
    return this.options.maxFiles === 0 || files.length <= this.options.maxFiles ? true : false;
  }

  /**
   * Assain Upload Callbacks
   *
   * @param {object} uploadOptions
   * @param {EventInterface} eventData
   * @param {NormalizeFileInterface[]} files
   * @returns {void}
   * @memberof Uploads
   */
  private assainUploadCallbacks(uploadOptions: filestack.ClientOptions, eventData, files: NormalizeFileInterface[]) {
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

  /**
   * Assain Upload Events
   *
   * @param {EventInterface} eventData
   * @param {object} token
   * @returns {void}
   * @memberof Uploads
   */
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

  /**
   * Upload Event Control
   *
   * @param {string} elementId
   * @param {string} uploadId
   * @param {UploadControllActionEnum} type
   * @returns {void}
   * @memberof Uploads
   */
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

  /**
   * Upload Event Control
   *
   * @param {string} elementId
   * @param {string} uploadId
   * @param {UploadControllActionEnum} type
   * @returns {void}
   * @memberof Uploads
   */
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

  /**
   * Listener uploadFiles event
   *
   * @returns {void}
   * @memberof Uploads
   */
  private assainEvents() {
    this.eventEmitter.on('uploadFiles', (event: EventInterface) => {
      this.upload(event);
    });
  }
}
