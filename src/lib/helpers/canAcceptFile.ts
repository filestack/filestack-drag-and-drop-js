import * as filestack from 'filestack-js';

import { AppConfigInterface } from './../interfaces/appConfigInterface';
import { appConfig } from './../config/app';
import { EventEmitter } from './../helpers';

import { UploadCodeEnum, UploadStatusEnum } from './../enum/upload';

export class CanAcceptFileHelper {
  private config: AppConfigInterface;

  constructor(private eventEmitter: EventEmitter, config?: AppConfigInterface, private sdk?: filestack.Client) {
    if (config) {
      this.config = config;
    } else {
      this.config = appConfig;
    }
  }

  public canAcceptFile(file: File) {
    const canAcceptMinetype = this.canAcceptMinetype(file);
    const canAcceptSize = this.maxSize(file);

    if (!canAcceptMinetype) {
      this.eventEmitter.emit(UploadStatusEnum.error, { data: file, code: UploadCodeEnum.MINETYPE });
    }

    if (!canAcceptSize) {
      this.eventEmitter.emit(UploadStatusEnum.error, { data: file, code: UploadCodeEnum.MAX_FILE_SIZE });
    }

    if (canAcceptMinetype && canAcceptSize) {
      return true;
    }

    return false;
  }

  public canAcceptMinetype(file: File): boolean {
    if (this.config.accept === undefined || this.config.accept.length === 0) {
      return true;
    }
    return this.config.accept.some(singleAcceptOption => {
      const minetype: string = this.sdk.utils.extensionToMime(file.name);

      if (this.isMimetype(singleAcceptOption)) {
        return this.matchesMimetype(minetype, singleAcceptOption);
      }
      return this.matchesExtension(file, singleAcceptOption);
    });
  }

  public matchesMimetype(minetype: string, singleAcceptOption: string): boolean {
    if (minetype && singleAcceptOption === 'image/*') {
      return minetype.indexOf('image/') !== -1;
    }
    if (minetype && singleAcceptOption === 'video/*') {
      return minetype.indexOf('video/') !== -1;
    }
    if (minetype && singleAcceptOption === 'audio/*') {
      return minetype.indexOf('audio/') !== -1;
    }
    if (minetype && singleAcceptOption === 'application/*') {
      return minetype.indexOf('application/') !== -1;
    }
    if (minetype && singleAcceptOption === 'text/*') {
      return minetype.indexOf('text/') !== -1;
    }

    if (minetype && ['image/jpg', 'image/jpeg'].indexOf(singleAcceptOption) > -1) {
      return ['image/jpg', 'image/jpeg'].indexOf(minetype) > -1;
    }

    return minetype === singleAcceptOption;
  }

  public maxSize(file: File): boolean {
    return this.config.maxSize === 0 || file.size <= this.config.maxSize ? true : false;
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
