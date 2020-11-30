import { EventEmitter } from './EventEmitter';

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

    elements.forEach((element: HTMLElement) => {
      this.addElement(element);
    });
  }

  public addElement(element: HTMLElement) {
    this.assignEvents(element);
    this.elements.push(element);
  }

  public addElements(elements: HTMLElement[] | NodeListOf<Element>) {
    if (!elements || elements.length <= 0) {
      return;
    }

    elements.forEach((element: HTMLElement) => {
      this.addElement(element);
    });
  }

  public assignEvents(element: HTMLElement) {
    ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
      element.addEventListener(eventName, this.preventDefaults.bind(this), false);
    });

    element.addEventListener('drop', this.dropEvent.bind(this), false);

    if (!element.getAttribute('data-fs-dnd-token')) {
      element.setAttribute('data-fs-dnd-id', this.generateDataId());
    }
  }

  public preventDefaults(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    let target = <HTMLElement>event.target;
    this.eventEmitter.emit(`event.${event.type}`, { id: target.getAttribute('data-fs-dnd-id'), event });
  }

  public dropEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    let target = <HTMLElement>event.target;
    this.eventEmitter.emit('upload', { id: target.getAttribute('data-fs-dnd-id'), event });
  }

  private generateDataId() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
}
