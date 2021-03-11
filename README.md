<p align="center">
  <a href="https://www.filestack.com"><img src="https://static.filestackapi.com/filestack.svg?refresh" align="center" width="250" /></a>
</p>
<p align="center">
  <a href="https://npmjs.com/package/filestack-js"><img src="https://img.shields.io/npm/v/filestack-js.svg" /></a>

  <img src="https://img.shields.io/badge/module%20formats-umd%2C%20esm-green.svg" />
  <br/>
  <img src="https://badges.herokuapp.com/browsers?labels=none&googlechrome=latest&firefox=latest&microsoftedge=latest&safari=latest&iphone=latest" />
</p>
<p align="center">
  <strong>Javascript drag and drop used by filestack</strong>
</p>
<hr/>

- [Filestack Drag And Drop](#filestack-drag-and-drop)
  - [Getting Started](#getting-started)
    - [UMD module](#umd-module)
    - [SRI](#sri)
  - [Objects:](#objects)
    - [FilestackDnD](#filestackdnd)
      - [Constructor](#constructor)
      - [Properties](#properties)
      - [Methods](#methods)
    - [ElementHelper](#elementhelper)
      - [Properties](#properties-1)
      - [Methods](#methods-1)
    - [UploadHelper](#uploadhelper)
      - [Methods](#methods-2)
  - [Events](#events)
      - [How to listen to events](#how-to-listen-to-events)
      - [How to send events](#how-to-send-events)
  - [Examples of usage](#examples-of-usage)
  - [Contributing](#contributing)

# Filestack Drag And Drop

With Filestack-Drag-and-Drop you can easily add drag-and-drop file uploading support to your website. You only need 3 lines of code to make any element on your page able to do that. Filestack-drag-and-drop is a frontend to our JavaScript SDK library.

## Getting Started

### UMD module

To integrate FIlestack-Drag-and-Drop with your web application simply include our UMD module in your code:

```html
<script src="//static.filestackapi.com/filestack-drag-and-drop-js/{MAJOR_VERSION}.x.x/filestack-drag-and-drop.min.js"></script>
```

Add an element to your page:

```html
<div class="drop-container">Drag and Drop</div>
```

and initialize Filestack Drag and Drop:

```js
const filestackDnD = new filestackDnD.FilestackDnD('API_KEY', document.querySelector('.drop-container'));
```

That's it. Now your page element handles the upload by dropping a file on it.


Example initialization with filestack Client:
```js
const filestackClient = filestack.init('API_KEY');
const filestackDnD = new filestackDnD.FilestackDnD(filestackClient, document.querySelector('.drop-container'));
```

Example initialization with Options (only image, max size: 1024, max files: 2):
```js
const config = {
  accept: ['image/*'], // default empty array - all files
  maxSize: 1024, // default 0 - no limit
  maxFiles: 2, // default 0 - no limit
  failOverMaxFiles: false, 
}

const filestackDnD = new filestackDnD.FilestackDnD('API_KEY', document.querySelector('.drop-container'), config);
```

Example initialization with sdkConfig:
```js
const sdkConfig = {
  cname: 'cname_test',
  security: {
      policy : 'policy_test',
      signature: 'signature_test'
  }
}

const filestackDnD = new filestackDnD.FilestackDnD('API_KEY', document.querySelector('.drop-container'), null, null, testConfig);
```

### SRI
Subresource Integrity (SRI) is a security feature that enables browsers to verify that files they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched file must match

To obtain sri hashes for filestack-tools library check manifest.json file on CDN:

```js
@todo
https://static.filestackapi.com/filestack-drag-and-drop-js/{LIBRARY_VERSION}/manifest.json
```

```js
@todo
<script src="//static.filestackapi.com/filestack-drag-and-drop-js/{LIBRARY_VERSION}/filestack-drag-and-drop.min.js" integrity="{FILE_HASH}" crossorigin="anonymous"></script>
```

Where {LIBRARY_VERSION} is currently used library version and {FILE_HASH} is one of the hashes from integrity field in manifest.json file


## Objects:

### FilestackDnD
#### Constructor
```js
constructor(apikey: string | Client, element?: HTMLElement, options?: OptionsInterface, sdkConfig?: ClientOptions)
```

| Name        | Type           | Description  |
|:------------- |:-------------|:-----|
| apikey      | string \| Client | Application ApiKey or instance Client from filstackSDK |
| element (optional)      | HTMElement      | The HTML element that should listen to events |
| options (optional) | OptionsInterface      | Settings related to uploading |
| sdkConfig (optional) | Client | Settings for SDK |

#### Properties
| Name        | Type           | Description  |
|:------------- |:-------------|:-----|
| elementsHelper      | [ElementHelper](#elementhelper) | Manages elements |
| eventEmmitrerHelper      | EventEmitter | Manages events |
| uploadsHelper      | [UploadHelper](#uploadhelper) | Manages uploading |
| filstackSdk      | <a href="https://filestack.github.io/filestack-js/classes/client.html">Client</a> | Client form filstackSDK |

Example:
Use elementsHelper - set new HTMLElement:
```js
filestackDnD.elementHelper.setElement(document.querySelector('.someElement'))
```

Use eventEmmitrerHelper - listen to events:
```js
filestackDnD.eventEmmitrerHelper.on('dragover', (res) => {console.log(e)})
```

Use uploadsHelper - set Upload Options:
```js
filestackDnD.uploadsHelper.setUploadOptions()
```

Use filstackSdk - open picker:
```js
filestackDnD.filstackSdk.picker(options).open();
```

#### Methods 
| Name        | Parameters           | Description  | Return |
|:------------- |:-------------|:-----|:------|
| setElements      | elements: HTMLElement \| HTMLElement[] \| NodeListOf<Element> | Adds elements to support Drag and Drop | void |
| setUploadOptions      | uploadOptions: UploadOptions | Adds an option to upload files | void |
| on      | event: string, ...args: any[] | Listening to events. List of available events | void |
| emit      | event: string, listener: Listener | Sending events. List of available events | void |


### ElementHelper

#### Properties
| Name        | Type           | Description  |
|:------------- |:-------------|:-----|
| elements      | HTMLElement[] | Manages elements |

#### Methods 
| Name        | Parameters           | Description  | Return |
|:------------- |:-------------|:-----|:------|
| setElement      | element: HTMLElement | Adding an item. Previous elements are overwritten | void |
| setElements      | elements: HTMLElement[] \| NodeListOf<Element> | Adding items. The previous ones are overwritten  | void |
| addElement      | element: HTMLElement | Adding element to the list | void |
| addElements      | elements: HTMLElement[] \| NodeListOf<Element> | Adding items to the list | void |
  
  
### UploadHelper

#### Methods 
| Name        | Parameters           | Description  | Return |
|:------------- |:-------------|:-----|:------|
| setUploadOptions      | uploadOptions: UploadOptions | Set upload Options | void |
| setStoreUploadOptions      | storeUploadOptions: StoreUploadOptions | Set store upload options  | void |
| setSecurity      | security: Security | set security config | void |


## Events
You can interact programmatically with Filestack Drag and Drop

#### How to listen to events
```js
filestackDnD.on('eventName', (e) => {console.log(e)});
```

| Name        | Description           | Return  |
|:------------- |:-------------|:-----|
| successReadFile      | Reading files through browsers | SuccessReadFileInterface |
| progress      | Checking the progress | ProgressInterface |
| dragover      | Event triggered when an object is dragged over an element added to Drag and Drop | { elementId: string, data: DragEvent } |
| dragleave      | Event triggered when the user moves the cursor outside a Drag and Drop supported item | { elementId: string, data: DragEvent } |
| drop      | Event triggered when user drops a file over an item  | { elementId: string, data: DragEvent } |
| uploadFileFinish      | Event triggered when uploading a file is successful | { elementId: string, files: NormalizeFileInterface[], data: res } |
| error      | Event triggered when there are some errors e.g. wrong file format, problems with uploading etc | EventInterface |

#### How to send events
```js
filestackDnD.emit('eventName', { elementId: null, fileId: id });
```
* elementId: string - This is the identifier of the HTML element. A unique attribute is added: "data-fs-dnd-element-id" To every element added to DragAndDrop.
* fileId: string - Each file has its own unique Id.


If we send an elementId to some event, the event will be called for all files added to this element.
If we send only fileId the event will be fired only for the specific file

| Name        | Description |
|:------------- |:-------------|
| pause      | Stops the upload |
| resume      | Resumes the upload |
| cancel      | Aborts file upload |


## Examples of usage

Take a look at the examples folder as well. We show various use cases there (example_simple.html):
<br>
<br>
<img src="https://cdn.filestackcontent.com/Los1dmb9RbyIqEeZN0zE" width="500px">
 

Multiple drag and drop elements on the page (example_multi_pane.html):
<br>
<br>
<img src="https://cdn.filestackcontent.com/r61Ujd9JRxawK56k0pYQ" width="500px">

List of uploaded files with progress (example_file_lists.html):
<br>
<br>
<img src="https://cdn.filestackcontent.com/C8FelivqSzSnF8ifQLoa" width="500px">


## Contributing
We follow the <a href="https://conventionalcommits.org/">conventional commits</a> specification to ensure consistent commit messages and changelog formatting.