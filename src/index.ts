import * as filestack from 'filestack-js';
import { ElementsHelper, EventEmitter, Uploads } from './helpers';

class FilestackDnD {
  private fileStackJs: filestack.Client;
  private elements: ElementsHelper;
  private eventEmitter: EventEmitter;
  private uploads: Uploads;

  constructor(apikey: string, element?: HTMLElement) {
    this.fileStackJs = filestack.init(apikey);
    this.eventEmitter = new EventEmitter();
    this.elements = new ElementsHelper(this.eventEmitter, element);
    this.uploads = new Uploads(this.fileStackJs, this.eventEmitter);

    this.errorsEmit();
  }

  get elementsHelper(): ElementsHelper {
    return this.elements;
  }

  get eventEmitterHelper(): EventEmitter {
    return this.eventEmitter;
  }

  get uploadsHelper(): Uploads {
    return this.uploads;
  }

  get fileStackClient(): filestack.Client {
    return this.fileStackJs;
  }

  public errorsEmit() {
    this.fileStackJs.on('upload.error', filestackError => {
      this.eventEmitter.emit('upload.error', filestackError);
    });
  }
}
