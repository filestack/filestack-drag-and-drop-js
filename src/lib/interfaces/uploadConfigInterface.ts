import { UploadOptions, StoreUploadOptions, Security } from 'filestack-js';

export interface UploadConfigInterface {
  uploadOptions: UploadOptions;
  storeUploadOptions: StoreUploadOptions;
  security: Security;
}
