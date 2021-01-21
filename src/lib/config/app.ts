import { AppConfigInterface } from './../interfaces';

export const appConfig: AppConfigInterface = {
  accept: [], // empty array - all files
  maxSize: 0, // 0 - no limit
  maxFiles: 0, // 0 - no limit
  failOverMaxFiles: false,
  clickOpenSelectedFile: false,
};
