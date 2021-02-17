import { Client, ClientOptions, UploadOptions, init } from 'filestack-js';
// import loader from 'filestack-loader';

import { ElementsHelper, EventEmitter, Uploads } from './lib/helpers';
import { OptionsInterface } from './lib/interfaces';
import { appConfig } from './lib/config/app';
import { UploadStatusEnum } from './lib/enum/upload';

type Listener = (...args: any[]) => void;
const SDK_PATH = 'https://static.filestackapi.com/filestack-js/3.x.x/filestack.min.js';

export class FilestackDnD {
  private sdk: Client;
  private elements: ElementsHelper;
  private eventEmitter: EventEmitter;
  private uploads: Uploads;

  /**
   * Constructor
   *
   * @param {string | object} apikey
   * @param {HTMLElement} element
   * @param {OptionsInterface} options
   * @param {object} sdkConfig
   * @returns {void}
   * @memberof FilestackDnD
   */
  constructor(apikey: string | Client, element?: HTMLElement, options?: OptionsInterface, sdkConfig?: ClientOptions) {
    if (!options) {
      options = appConfig; // default config
    } else {
      options = Object.assign(appConfig, options);
    }

    this.eventEmitter = new EventEmitter();
    this.elements = new ElementsHelper(this.eventEmitter, element);


    if (typeof apikey === 'string') {
      // loader.loadModule('https://static.filestackapi.com/picker/v3/picker-0.10.5.js', loader.knownModuleIds.picker)
      //     .then((Picker) => {
      //       this.sdk = new Picker(apikey, sdkConfig);
      //       this.init(options);
      //     });

      this.sdk = init(apikey, sdkConfig);
      this.init(options);
    } else {
      this.sdk = apikey;
      this.init(options);
    }
  }

  private init(options: OptionsInterface) {
    this.uploads = new Uploads(this.sdk, this.eventEmitter, options);
    this.initErrorEvents();
  }

  /**
   * Get elements helper - add elements and bind drag and drop events
   *
   * @returns {ElementsHelper}
   * @memberof FilestackDnD
   */
  get elementsHelper(): ElementsHelper {
    return this.elements;
  }

  /**
   * Get EventEmitter - listener and emit event
   *
   * @returns {EventEmitter}
   * @memberof FilestackDnD
   */
  get eventEmitterHelper(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Get uploads object
   *
   * @returns {Uploads}
   * @memberof FilestackDnD
   */
  get uploadsHelper(): Uploads {
    return this.uploads;
  }

  /**
   * Get filestack Client SDK
   *
   * @returns {Uploads}
   * @memberof FilestackDnD
   */
  get filestackSdk(): Client {
    return this.sdk;
  }

  /**
   * Add Element - event bindin on Elements
   *
   * @param {HTMLElement | HTMLElement[] | NodeListOf<Element>} elements
   * @returns {void}
   * @memberof FilestackDnD
   */
  public setElements(elements: HTMLElement | HTMLElement[] | NodeListOf<Element>) {
    if (elements instanceof HTMLElement) {
      this.elementsHelper.setElement(elements);
    } else {
      this.elementsHelper.setElements(elements);
    }
  }

  /**
   * Set Upload Options
   *
   * @param {UploadOptions} uploadOptions
   * @returns {void}
   * @memberof FilestackDnD
   */
  public setUploadOptions(uploadOptions: UploadOptions) {
    this.uploadsHelper.setUploadOptions(uploadOptions);
  }

  /**
   * Bind event listener
   *
   * @param {string} event
   * @param {Listener} listener
   * @returns {() => void}
   * @memberof FilestackDnD
   */
  public on(event: string, listener: Listener) {
    return this.eventEmitterHelper.on(event, listener);
  }

  /**
   * Emit event
   *
   * @param {string} event
   * @param {...any[]} args
   * @returns {void}
   * @memberof FilestackDnD
   */
  public emit(event: string, ...args: any[]) {
    return this.eventEmitterHelper.emit(event, args);
  }

  /**
   * Init Error Events
   *
   * @returns {void}
   * @memberof FilestackDnD
   */
  private initErrorEvents() {
    this.sdk.on('upload.error', filestackError => {
      this.eventEmitter.emit(UploadStatusEnum.error, { data: filestackError });
    });
  }
}
