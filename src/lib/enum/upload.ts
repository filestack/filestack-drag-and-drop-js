export enum UploadStatusEnum {
  error = 'error',
  info = 'info',
  progress = 'progress',
  finish = 'finish',
  retry = 'retry',
  uploadFileFinish = 'uploadFileFinish',
  successReadFile = 'successReadFile'
};

export enum UploadCodeEnum {
  MAX_FILES = 'MAX_FILES',
  MAX_FILE_SIZE = 'MAX_FILE_SIZE',
  MINETYPE = 'MINETYPE',
};

export enum ErrorCodeEnum {
  MAX_FILES = 'MAX_FILES',
  MAX_FILE_SIZE = 'MAX_FILE_SIZE',
  MINETYPE = 'MINETYPE',
};

export enum UploadControllActionEnum {
  PAUSE = 'pause',
  CANCEL = 'cancel',
  RESUME = 'resume'
}
