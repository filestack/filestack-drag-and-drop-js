import * as filestack from 'filestack-js';

import { ElementsHelper, EventEmitter, Uploads } from './helpers';
import { AppConfigInterface } from './interfaces';
import { appConfig } from './config/app';

export class FilestackDnD {
  private fileStackJs: filestack.Client;
  private elements: ElementsHelper;
  private eventEmitter: EventEmitter;
  private uploads: Uploads;

  constructor(apikey: string, element?: HTMLElement, options?: filestack.ClientOptions, appConfigs?: AppConfigInterface) {
    this.fileStackJs = filestack.init(apikey, options);
    this.eventEmitter = new EventEmitter();
    this.elements = new ElementsHelper(this.eventEmitter, element);

    if (!appConfigs) {
      appConfigs = appConfig; // default config
    }

    this.uploads = new Uploads(this.fileStackJs, this.eventEmitter, appConfigs);

    this.initErrorEvents();
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

  private initErrorEvents() {
    this.fileStackJs.on('upload.error', filestackError => {
      this.eventEmitter.emit('upload', { data: filestackError, type: 'error' });
    });
  }
}

// @todo inject config to uploads ??
