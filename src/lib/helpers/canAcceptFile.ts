import { AppConfigInterface } from './../interfaces/appConfigInterface';
import { appConfig } from './../config/app';
import { EventEmitter } from './../helpers';

import { UploadCodeEnum } from './../enum/upload';

// @todo add errorEvent
export class CanAcceptFileHelper {
  private config: AppConfigInterface;

  constructor(private eventEmitter: EventEmitter, config?: AppConfigInterface) {
    if (config) {
      this.config = config;
    } else {
      this.config = appConfig;
    }
  }

  public canAcceptFile(file: File) {
    let canAcceptMinetype = this.canAcceptMinetype(file);
    let canAcceptSize = this.maxSize(file);

    if (!canAcceptMinetype) {
      this.eventEmitter.emit('upload', { type: 'error', data: file, code: UploadCodeEnum.MINETYPE });
    }

    if (!canAcceptSize) {
      this.eventEmitter.emit('upload', { type: 'error', data: file, code: UploadCodeEnum.MAX_FILE_SIZE });
    }

    if (canAcceptMinetype && canAcceptSize) {
      return true;
    }

    return false;
  }

  public canAcceptMinetype(file: File): boolean {
    if (this.config.allowMinMimetype === undefined || this.config.allowMinMimetype.length === 0) {
      return true;
    }
    return this.config.allowMinMimetype.some(singleAcceptOption => {
      if (this.isMimetype(singleAcceptOption)) {
        return this.matchesMimetype(file, singleAcceptOption);
      }
      return this.matchesExtension(file, singleAcceptOption);
    });
  }

  public matchesMimetype(file: File, singleAcceptOption: string): boolean {
    if (file.type && singleAcceptOption === 'image/*') {
      return file.type.indexOf('image/') !== -1;
    }
    if (file.type && singleAcceptOption === 'video/*') {
      return file.type.indexOf('video/') !== -1;
    }
    if (file.type && singleAcceptOption === 'audio/*') {
      return file.type.indexOf('audio/') !== -1;
    }
    if (file.type && singleAcceptOption === 'application/*') {
      return file.type.indexOf('application/') !== -1;
    }
    if (file.type && singleAcceptOption === 'text/*') {
      return file.type.indexOf('text/') !== -1;
    }

    if (file.type && ['image/jpg', 'image/jpeg'].indexOf(singleAcceptOption) > -1) {
      return ['image/jpg', 'image/jpeg'].indexOf(file.type) > -1;
    }

    return file.type === singleAcceptOption;
  }

  public maxSize(file: File): boolean {
    return file.size <= this.config.maxFileSize ? true : false;
  }

  public isMimetype(str: string): boolean {
    return str.indexOf('/') !== -1;
  }

  public extractExtension(filename: string): string {
    const match = /\.\w+$/.exec(filename);
    return match && match.length && match[0];
  }

  public normalizeExtension(ext: string): string {
    return ext.replace('.', '').toLowerCase();
  }

  public matchesExtension(file: File, singleAcceptOption: string): boolean {
    const ext: string = this.extractExtension(file.name) || '';
    const fileExt: string = this.normalizeExtension(ext);
    const acceptExt: string = this.normalizeExtension(singleAcceptOption);
    return fileExt === acceptExt;
  }
}
