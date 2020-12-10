import { AppConfigInterface } from "./../interfaces";

export const appConfig: AppConfigInterface = {
  accept: [], // empty array - all files
  maxSize: 0, // 0 - no limit
  maxFiles: 0, // 0 - no limit
  uploadMaxFiles: true, // if upload files > maxFiles - upload only first ${maxFiles} files
};
