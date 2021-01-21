import { EventEmitter } from './eventEmitter';
import { appConfig } from './../config/app';
import { guid } from './../utils/guid';

export class ElementsHelper {
  private elementsArray: HTMLElement[] = [];

  public constructor(private eventEmitter: EventEmitter, element?: HTMLElement) {
    if (element) {
      this.setElement(element);
    }
  }

  get elements(): HTMLElement[] {
    return this.elementsArray;
  }

  public setElement(element: HTMLElement) {
    this.assignEvents(element);
    this.elementsArray = [element];
  }

  public setElements(elements: HTMLElement[] | NodeListOf<Element>) {
    if (!elements || elements.length <= 0) {
      return;
    }

    this.elementsArray = [];
    elements.forEach((element: HTMLElement) => this.addElement(element));
  }

  public addElement(element: HTMLElement) {
    this.assignEvents(element);
    this.elements.push(element);
  }

  public addElements(elements: HTMLElement[] | NodeListOf<Element>) {
    if (!elements || elements.length <= 0) {
      return;
    }

    elements.forEach((element: HTMLElement) => this.addElement(element));
  }

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

  public assignClickEvent(event) {
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

  public assignDragEvent(event: DragEvent) {
    event.preventDefault();

    const target: HTMLElement = event.target as HTMLElement;
    this.eventEmitter.emit(event.type, { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });
  }

  public dropEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    this.eventEmitter.emit(event.type, { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });
    this.eventEmitter.emit('uploadFiles', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event });
  }
}
