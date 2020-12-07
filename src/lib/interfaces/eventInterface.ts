import { UploadStatusEnum, UploadCodeEnum } from './../enum/upload';

export interface EventInterface {
  elementId?: string;
  code?: UploadCodeEnum;
  type: UploadStatusEnum;
  data;
}
