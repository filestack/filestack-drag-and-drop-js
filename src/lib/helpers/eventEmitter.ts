export type Listener = (...args: any[]) => void;
interface Events {
  [event: string]: Listener[];
}

/**
 * Event Emitter
 */
export class EventEmitter {
  private readonly events: Events = {};

  /**
   * Bind event listener
   *
   * @param {string} event
   * @param {Listener} listener
   * @returns {() => void}
   * @memberof EventEmitter
   */
  public on(event: string, listener: Listener): () => void {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  /**
   * Unbind event listener
   *
   * @param {string} event
   * @param {Listener} listener
   * @returns {void}
   * @memberof EventEmitter
   */
  public off(event: string, listener?: Listener): void {
    if (typeof this.events[event] !== 'object') {
      return;
    }

    if (!listener) {
      delete this.events[event];
      return;
    }

    const idx: number = this.events[event].indexOf(listener);
    if (idx > -1) {
      this.events[event].splice(idx, 1);
    }
  }

  /**
   * Destroy all events
   *
   * @memberof EventEmitter
   */
  public destroy(): void {
    Object.keys(this.events).forEach((event: string) => this.events[event].splice(0, this.events[event].length));
  }

  /**
   * Emit event
   *
   * @param {string} event
   * @param {...any[]} args
   * @returns {void}
   * @memberof EventEmitter
   */
  // @todo if listner has more than 2 args waif for next or check if its return promise and wait for it emit have to always return promise
  // if no promise or less than 2 args just fire promise.resolve()
  public emit(event: string, ...args: any[]): void {
    if (typeof this.events[event] !== 'object') {
      return;
    }

    this.events[event].forEach(listener => listener.apply(this, args));
  }

  /**
   * Bind event listener only once
   *
   * @param {string} event
   * @param {Listener} listener
   * @memberof EventEmitter
   */
  public once(event: string, listener: Listener): void {
    const remove: () => void = this.on(event, (...args: any[]) => {
      remove();
      listener.apply(this, args);
    });
  }
}
