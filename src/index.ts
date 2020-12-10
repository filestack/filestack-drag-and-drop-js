//getMimetype
import { Client, ClientOptions, UploadOptions, init } from 'filestack-js';

import { ElementsHelper, EventEmitter, Uploads } from './lib/helpers';
import { AppConfigInterface } from './lib/interfaces';
import { appConfig } from './lib/config/app';
import { UploadStatusEnum } from './lib/enum/upload';

type Listener = (...args: any[]) => void;
const SDK_PATH = 'https://static.filestackapi.com/filestack-js/3.x.x/filestack.min.js';

export class FilestackDnD {
  private sdk: Client;
  private elements: ElementsHelper;
  private eventEmitter: EventEmitter;
  private uploads: Uploads;
  private loaderPromise: Promise<any>;

  constructor(apikey: string | Client, element?: HTMLElement, appConfigs?: AppConfigInterface, sdkConfig?: ClientOptions) {
    if (!appConfigs) {
      appConfigs = appConfig; // default config
    } else {
      appConfigs = Object.assign(appConfig, appConfigs);
    }

    this.eventEmitter = new EventEmitter();
    this.elements = new ElementsHelper(this.eventEmitter, element);


    if (typeof apikey === 'string') {
      this.sdk = init(apikey, sdkConfig);
      this.init(appConfigs);
    } else {
      this.sdk = apikey;
      this.init(appConfigs);
    }
  }

  private init(appConfigs: AppConfigInterface) {
    this.uploads = new Uploads(this.sdk, this.eventEmitter, appConfigs);
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

  get fileStackSdk(): Client {
    return this.sdk;
  }

  public setElements(elements: HTMLElement | HTMLElement[] | NodeListOf<Element>) {
    if (elements instanceof HTMLElement) {
      this.elementsHelper.setElement(elements);
    } else {
      this.elementsHelper.setElements(elements);
    }
  }

  public setUploadOptions(uploadOptions: UploadOptions) {
    this.uploadsHelper.setUploadOptions(uploadOptions);
  }

  public on(event: string, listener: Listener) {
    return this.eventEmitterHelper.on(event, listener);
  }

  public emit(event: string, ...args: any[]) {
    return this.eventEmitterHelper.emit(event, args);
  }

  private initErrorEvents() {
    this.sdk.on('upload.error', filestackError => {
      this.eventEmitter.emit(UploadStatusEnum.error, { data: filestackError });
    });
  }
}
