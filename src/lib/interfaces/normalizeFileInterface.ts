/**
 * Normalize File
 *
 * @interface NormalizeFileInterface
 */
export interface NormalizeFileInterface {
  mimetype: string;
  name: string;
  originalFile: File;
  path: string;
  progress: number;
  progressSize: string;
  size: number
  source: string
  uploadId: string
  uuid: string
}
