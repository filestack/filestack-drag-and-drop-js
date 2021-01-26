import { OptionsInterface } from './../interfaces';

export const appConfig: OptionsInterface = {
  accept: [], // empty array - all files
  maxSize: 0, // 0 - no limit
  maxFiles: 0, // 0 - no limit
  failOverMaxFiles: false,
  clickOpenSelectedFile: false,
};
