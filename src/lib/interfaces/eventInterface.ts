import { UploadStatusEnum, UploadCodeEnum } from './../enum/upload';
import { NormalizeFileInterface } from './normalizeFileInterface';

export interface EventInterface {
  elementId?: string;
  code?: UploadCodeEnum;
  type?: UploadStatusEnum;
  files?: NormalizeFileInterface[];
  error?: any;
  data?: any;
}
