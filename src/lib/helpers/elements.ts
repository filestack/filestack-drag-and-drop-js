import { EventEmitter } from './eventEmitter';
import { appConfig } from './../config/app';
import { guid } from './../utils/guid';

/**
 * Elements Helper - add elements and bind drag and drop events
 */
export class ElementsHelper {

  private elementsArray: HTMLElement[] = [];

  /**
   * Constructor
   *
   * @param {EventEmitter} eventEmitter
   * @param {HTMLElement} element
   * @returns {void}
   * @memberof ElementsHelper
   */
  public constructor(private eventEmitter: EventEmitter, element?: HTMLElement) {
    if (element) {
      this.setElement(element);
    }
  }

  /**
   * Add Events to HTMLElement. Remove old element
   *
   * @returns {HTMLElement[]}
   * @memberof ElementsHelper
   */
  get elements(): HTMLElement[] {
    return this.elementsArray;
  }

  /**
   * Add Events to HTMLElement. Remove old element
   *
   * @param {HTMLElement} element
   * @returns {void}
   * @memberof ElementsHelper
   */
  public setElement(element: HTMLElement) {
    this.assignEvents(element);
    this.elementsArray = [element];
  }

  /**
   * Add Events to elements HTMLElement. Remove old element.
   *
   * @param {HTMLElement | NodeListOf<Element>} elements
   * @returns {void}
   * @memberof ElementsHelper
   */
  public setElements(elements: HTMLElement[] | NodeListOf<Element>) {
    if (!elements || elements.length <= 0) {
      return;
    }

    this.elementsArray = [];
    elements.forEach((element: HTMLElement) => this.addElement(element));
  }

  /**
   * Add Events to element HTMLElement.
   *
   * @param {HTMLElement} element
   * @returns {void}
   * @memberof ElementsHelper
   */
  public addElement(element: HTMLElement) {
    this.assignEvents(element);
    this.elements.push(element);
  }

  /**
   * Add Events to elements HTMLElement.
   *
   * @param {HTMLElement | NodeListOf<Element>} elements
   * @returns {void}
   * @memberof ElementsHelper
   */
  public addElements(elements: HTMLElement[] | NodeListOf<Element>) {
    if (!elements || elements.length <= 0) {
      return;
    }

    elements.forEach((element: HTMLElement) => this.addElement(element));
  }

  /**
   * Assign Events
   *
   * @param {HTMLElement} element
   * @returns {void}
   * @memberof ElementsHelper
   */
  public assignEvents(element: HTMLElement) {
    ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
      element.addEventListener(eventName, this.assignDragEvent.bind(this), false);
    });

    element.addEventListener('drop', this.dropEvent.bind(this), false);
    element.addEventListener('click', this.assignClickEvent.bind(this));

    if (!element.getAttribute('data-fs-dnd-element-id')) {
      element.setAttribute('data-fs-dnd-element-id', guid());
    }
  }

  /**
   * Assign Click Events
   *
   * @param {Event} event
   * @returns {void}
   * @memberof ElementsHelper
   */
  private assignClickEvent(event) {
    const target: HTMLElement = event.target as HTMLElement;
    this.eventEmitter.emit('click', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });

    if(appConfig.clickOpenSelectedFile) {
      if(target.getAttribute('type') === 'type') {
        target.click();
      } else {
        const input = document.createElement('input')
        input.type = 'file';
        input.style.display = 'none';
        input.setAttribute('data-fs-dnd-element-id', target.getAttribute('data-fs-dnd-element-id'));

        if(appConfig.maxFiles > 1) {
          input.multiple = true
        }

        if(appConfig.accept.length > 0) {
          input.accept = appConfig.accept.join(',');
        }

        document.body.append(input);
        input.click();

        input.addEventListener('change', (changeEvent) => {
          this.eventEmitter.emit('uploadFiles', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: changeEvent });
        })
      }
    }
  }

  /**
   * Assign Drag Events
   *
   * @param {DragEvent} event
   * @returns {void}
   * @memberof ElementsHelper
   */
  private assignDragEvent(event: DragEvent) {
    event.preventDefault();

    const target: HTMLElement = event.target as HTMLElement;
    this.eventEmitter.emit(event.type, { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });
  }

  /**
   * Assign Drop Events
   *
   * @param {DropEvent} event
   * @returns {void}
   * @memberof ElementsHelper
   */
  private dropEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    this.eventEmitter.emit(event.type, { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });
    this.eventEmitter.emit('uploadFiles', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event });
  }
}
