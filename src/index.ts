import * as filestack from 'filestack-js';
import { FilestackDnD } from './lib/filestackDragAndDrop';
import { AppConfigInterface } from './lib/interfaces/appConfigInterface';

export const filestackDnD = (apikey: string, element?: HTMLElement, options?: filestack.ClientOptions, config?: AppConfigInterface): FilestackDnD => {
  return new FilestackDnD(apikey, element, options, config);
};


    // var testElement = document.querySelectorAll('.test');
    // var testElement = <HTMLElement>document.querySelector('.test');
    // testElement.style.width ="100vw"
    // testElement.style.height ="100vh"

    // var client = filestackDnD('APEkwxKMZTsWNIP0XQsv2z');
    // client.elementsHelper.setElements([testElement]);
    // client.eventEmitterHelper.on('upload', e => {
    //   console.log('upload', e);
    // });



    // add data-fs-dnd-element-id or automatic generrate uid

    // const clinet = filestackDnD('API_KEY');
    // cant upload file clinet.eventEmmiter.emit('uploadFile', event); -> event - EventInterface {data: event}
    // cant upload file clinet.eventEmmiter.on('upload', (e) => {console.log('upload', e);});

    // const clinet = filestackDnD('API_KEY', HTML_ELEMENT);
    // cant upload file clinet.eventEmmiter.on('upload', (e) => {console.log('upload', e);});
