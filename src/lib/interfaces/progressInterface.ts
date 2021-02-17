/**
 * ProgressInterface
 *
 * @interface ProgressInterface
 */
export interface ProgressInterface {
  data: any;
  totalBytes: number;
  totalPercent: number;
  elementId: string;
  files: [
    {
      mimetype: string;
      name: string;
      originalFile: File;
      path: string;
      progress: number;
      progressSize: string;
      size: number
      source: string;
      uploadId: string;
      uuid: string;
      length: number;
    }
  ]
}
