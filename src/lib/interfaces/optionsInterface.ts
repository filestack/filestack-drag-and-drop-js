/**
 * Options
 *
 * @interface OptionsInterface
 */
export interface OptionsInterface {
  accept: string[];
  maxSize: number;
  maxFiles: number;
  failOverMaxFiles: boolean;
  clickOpenSelectedFile: boolean;
}
