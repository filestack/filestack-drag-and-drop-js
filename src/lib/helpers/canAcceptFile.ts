import { Client } from 'filestack-js';

import { OptionsInterface } from './../interfaces';
import { appConfig } from './../config/app';
import { EventEmitter } from './../helpers';

import { UploadCodeEnum, UploadStatusEnum } from './../enum/upload';

/**
 * Can Accept File Helper
 */
export class CanAcceptFileHelper {
  private config: OptionsInterface;

  /**
   * Constructor
   *
   * @param {EventEmitter} eventEmitter
   * @param {OptionsInterface} config
   * @param {Client} sdk
   * @returns {void}
   * @memberof CanAcceptFileHelper
   */
  constructor(private eventEmitter: EventEmitter, config?: OptionsInterface, private sdk?: Client) {
    if (config) {
      this.config = config;
    } else {
      this.config = appConfig;
    }
  }

  /**
   * Check file
   *
   * @param {File} file
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public canAcceptFile(file: File) {
    const canAcceptMinetype = this.canAcceptMinetype(file);
    const canAcceptSize = this.maxSize(file);

    if (!canAcceptMinetype) {
      console.log(1);
      this.eventEmitter.emit(UploadStatusEnum.error, { data: file, code: UploadCodeEnum.MINETYPE });
    }

    if (!canAcceptSize) {
      console.log(2);
      this.eventEmitter.emit(UploadStatusEnum.error, { data: file, code: UploadCodeEnum.MAX_FILE_SIZE });
    }

    if (canAcceptMinetype && canAcceptSize) {
      return true;
    }

    return false;
  }

  /**
   * Check accept minetype
   *
   * @param {File} file
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
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

  /**
   * Matches Mimetype
   *
   * @param {string} minetype
   * @param {string} singleAcceptOption
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
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

  /**
   * Max size
   *
   * @param {File} file
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public maxSize(file: File): boolean {
    return this.config.maxSize === 0 || file.size <= this.config.maxSize ? true : false;
  }

  /**
   * Is mineType
   *
   * @param {string} str
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public isMimetype(str: string): boolean {
    return str.indexOf('/') !== -1;
  }

  /**
   * Extract extension
   *
   * @param {string} filename
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public extractExtension(filename: string): string {
    const match = /\.\w+$/.exec(filename);
    return match && match.length && match[0];
  }

  /**
   * Normalize Extension
   *
   * @param {string} ext
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public normalizeExtension(ext: string): string {
    return ext.replace('.', '').toLowerCase();
  }

  /**
   * Matches Extension
   *
   * @param {File} file
   * @param {string} singleAcceptOption
   * @returns {boolean}
   * @memberof CanAcceptFileHelper
   */
  public matchesExtension(file: File, singleAcceptOption: string): boolean {
    const ext: string = this.extractExtension(file.name) || '';
    const fileExt: string = this.normalizeExtension(ext);
    const acceptExt: string = this.normalizeExtension(singleAcceptOption);
    return fileExt === acceptExt;
  }
}
