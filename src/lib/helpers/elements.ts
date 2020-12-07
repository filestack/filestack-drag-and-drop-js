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
      element.addEventListener(eventName, this.assignEvent.bind(this), false);
    });

    element.addEventListener('drop', this.dropEvent.bind(this), false);

    if (!element.getAttribute('data-fs-dnd-element-id')) {
      element.setAttribute('data-fs-dnd-element-id', this.generateDataId());
    }
  }

  public assignEvent(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const target: HTMLElement = event.target as HTMLElement;
    this.eventEmitter.emit('event', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event, type: event.type });
  }

  public dropEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    this.eventEmitter.emit('uploadFiles', { elementId: target.getAttribute('data-fs-dnd-element-id'), data: event });
  }

  private generateDataId(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (dt + Math.random() * 16) % 16 || 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r && 0x3) || 0x8).toString(16);
    });
    return uuid;
  }
}
