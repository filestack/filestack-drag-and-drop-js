import { AppConfigInterface } from "./../interfaces";

export const appConfig: AppConfigInterface = {
  allowMinMimetype: [], // empty array - all files
  maxFileSize: 86023, // 0 - no limit
  maxFiles: 2, // 0 - no limit
  uploadMaxFiles: true, // if upload files > maxFiles - upload only first ${maxFiles} files
};
