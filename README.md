# Filestack Drag And Drop

With Filestack-Drag-and-Drop you can easily add drag-and-drop file uploading support to your website. You only need 3 lines of code to make any element on your page able to do that. Filestack-drag-and-drop is a frontend to our JavaScript SDK library.

## Getting Started

To integrate FIlestack-Drag-and-Drop with your web application simply include our UMD module in your code:

```html
<script src="@todo add link"></script>
```

Add an element to your page:

```html
<div class="drop-container">Drag and Drop</div>
```

and initialize Filestack Drag and Drop:

```js
const client = new filestackDnD.FilestackDnD('API_KEY', document.querySelector('.drop-container'));
```

That's it. Now your page element handles the upload by dropping a file on it.


Example initialization with filestack Client:
```js
const filestackClient = filestack.init('API_KEY');
const client = new filestackDnD.FilestackDnD(filestackClient, document.querySelector('.drop-container'));
```

Example initialization with Options (only image, max size: 1024, max files: 2):
```js
const config = {
  acceptMimetype: ['image/*'], // default empty array - all files
  maxSize: 1024, // default 0 - no limit
  maxFiles: 2, // default 0 - no limit
  failOverMaxFiles: false, 
}

const client = new filestackDnD.FilestackDnD('API_KEY', document.querySelector('.drop-container'), config);
```

## Objects:

### FilestackDnD
#### Construktor: 
```js
constructor(apikey: string | Client, element?: HTMLElement, options?: OptionsInterface, sdkConfig?: ClientOptions)
```

| Name        | Type           | Description  |
|:------------- |:-------------|:-----|
<<<<<<< HEAD
| apikey      | string \| Client | application ApiKey or instance Client from filstackSDK |
=======
| apikey      | string \| Client | Application ApiKey or instance Client from filstackSDK |
>>>>>>> 1a72646ef234524c9f278bca99c5223314a46be5
| element (optional)      | HTMElement      | The HTML element that should listen to events |
| options (optional) | OptionsInterface      | Settings related to uploading |
| sdkConfig (optional) | Client      | Settings for SDK |

#### Properties
| Name        | Type           | Description  |
|:------------- |:-------------|:-----|
| elementsHelper      | ElementHelper | Manages elements |
| eventEmmitrerHelper      | EventEmitter | Manages events |
| uploadsHelper      | Uploads | Manages uploading |
| filstackSdk      | Client | Client form filstackSDK  |

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
You can interact programmatically with Filestack Drag and DropI using events. 

#### How to listen to events:
```js
client.on('eventName', (e) => {console.log(e)});
```

| Name        | Description           | Return  |
|:------------- |:-------------|:-----|
| successReadFile      | Reading files through browsers | SuccessReadFileInterface |
| progress      | Checking the progress | ProgressInterface |
| dragover      | Event triggered when an object is dragged over an element added to Drag and Drop | @todo |
| dragleave      | Event triggered when the user moves the cursor outside a Drag and Drop supported item | @todo |
| drop      | Event triggered when user drops a file over an item  | @todo |
| uploadFileFinish      | Event triggered when uploading a file is successful | @todo |
| error      | Event triggered when there are some errors e.g. wrong file format, problems with uploading etc | @todo |

#### How to send events
```js
client.emit('eventName', { elementId: null, fileId: id });
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


## Examples of usage:

Take a look at the examples folder as well. We show various use cases there:

 

Multiple drag and drop elements on the page:

List of uploaded files with progress:


