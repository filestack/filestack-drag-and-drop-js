import { UploadOptions, StoreUploadOptions, Security } from 'filestack-js';

/**
 * Upload Config
 *
 * @interface UploadConfigInterface
 */
export interface UploadConfigInterface {
  uploadOptions: UploadOptions;
  storeUploadOptions: StoreUploadOptions;
  security: Security;
}
