> ## Starting ## 

- [About](#about)
- [Requirements](#requirements)
- [Components](#components)

> ## Features ## 

- [Running](#running)
- [Editor](#editor)
- [Code generator](#code-generator)
- [Adding new angular module](#adding-new-angular-module)
- [Configuration](#configuration)
- [External libs](#external-libs)
- [Constants](#constants)
- [Menu](#menu)
- [Internationalization](#internationalization)
- [Conventions](#conventions)
- [CRUD](#crud)
- [Directives](#directives)
- [Components NgC2lib](#components-ngc2lib)
- [Icons](#icons)
- [Production](#production)

___

## About ##

- This project is intended to be used as a base for single page web applications
- It uses AngularJS 1.6.4

## Requirements ##

- It is recommended the use of Linux with APT
- A modern editor, like [vscode](https://code.visualstudio.com/)
- NodeJS 6 or above [See how to install](https://nodejs.org/en/download/package-manager/)
   - Configure the npm to run without sudo [tutorial](https://docs.npmjs.com/getting-started/fixing-npm-permissions)

## Components ##

> Components and frameworks used in this project

- [AngularJS](https://angularjs.org)
- [Angular Material](https://material.angularjs.org)
- [NgC2lib](git@gitlab.com:drypack/ngc2lib.git)
- [momentjs](http://momentjs.com)
- [lodaseh](https://lodash.com)
- [leaflet](http://leafletjs.com/)

## Running ##

- run the command **gulp** in the webapp/ folder
   - This command put together, the js and css files and inject them into the index.html
   - this command watch the changes in the file system and reprocess every time a js/sass file changes
> ### Editor ###

- [vscode](https://code.visualstudio.com/)
 - plugins used:
     - eslint (to identify formatting erros and code smells)
     - editor config (to configure codification, tabulation ...)
     - beautify (to format the code)
     - vscode-icons
     - angular material snippets
     - auto close tag

> ### Code generator ###

- install c2yogenerator
  - run "sudo npm install -g https://gitlab.com/drypack/c2yogenerator"
- Use the feature-by-folder structure generator to generate the necessary files to a new resource
- In the web app root folder run:

```sh
cd {web_app_root_folder}
yo c2generator
```

- Choose a structure in the list
- type the resource name

**For more information about how to use the generator go to [Generator C2yoGenerator](git@gitlab.com:drypack/c2yogenerator.git);**

> ### Adding new angular module ###

- add the dependence in the file package.json
- run the following command:

```sh
npm install {package-name} --save
```

- add the module path into the gulpfile.js
 - for angular imports add the entry in the array **paths.angularScripts**
 - when a new module is added, the gulp must be restarted
- add the module to the file /app/app.js

> ### Configuration ###

- Access the file app/app.config.js
- $translateProvider
 - Configure the module that translates the strings
- moment.locale('{en-US}');
 - configure the language and date formats
- $mdThemingProvider
 - configure the theme for angular material

> ### External libs ###
> (bibliotecas que não são módulos do angular)
> (Libs that are not angular modules)

- Acess the file **app/app.external.js**
- add the line:

```javascript
.constant('{CONSTANT_NAME}', {LIB_NAME});
```

> ### Constants ###

- access the file **app/app.global.js**
- add a new attribute containing the constant name and its value

> ### Menu ###
(Adding items in the menu)

- access the file **app/shared/partials/menu.html** and add/modifie an item 
based in the state defined in resource-name.route.js, in the line like  .state('app.resource-name' ...


> ### Internationalization ###

 - all the strings used in the application must be stored in the object located in the file **app/i18n/language-loader.service.js**
 - file structure:
     - in the first section are the strings unused in multiple places
     - following are the views strings divided in subsections:
         - breadcrumbs strings
         - titles strings
         - actions strings
         - fields strings
         - layout strings
         - tooltips string
     - resources attributes strings
     - dialogs strings
     - messages strings
     - the resource's name strings
 - by convention, the standard is the following
     - block with the common strings
     - block with the specific strings
         - block with the specific common strings
         - block with the resource's strings
 > ### Conventions ###
> (conventions adopted to standardize the project)

 - the set of files are called resource and placed always in the path **app**
 - each resource has the following files (when a compile resource is generated using the generator)
   - resource-name.html(index)
   - resource-name-list.html
   - resource-name-form.html
   - resource-name.controller.js
   - resource-name.route.js
   - resource-name.service.js
 - It must be used the resource structure generator to generate new resources
 - the image files are located in the path **images**
 - to change the css properties, change the file **styles/app.scss**

> ### CRUD ###

**crud.controller.js** (app/core/crud.controller.js)

- To inherit the base functionalities, you must, in the controller have the following snippet (already done by the resource generator):

```javascript
$controller('CRUDController',
 {
   vm: vm,
   modelService: {MODEL_SERVICE},
   options: { }
 }
);
```

- Options

```javascript
{
 redirectAfterSave: {BOOLEAN},
 searchOnInit: {BOOLEAN},
 perPage: {AMOUNT_PER_PAGE}
}
```

- Actions implemented

```javascript
activate()
search({page})
edit({resource})
save()
remove({resource})
goTo({state})
cleanForm()
```

- Hooks

```javascript
onActivate()
applyFilters(defaultQueryFilters) // receive an object with the filters applied and ca be changed
beforeSearch({page}) //returning false cancel the flow
afterSearch(response)
beforeClean() //returning false cancel the flow
afterClean()
beforeSave() //returning false cancel the flow
afterSave({resource})
beforeRemove({resource}) //returning false cancel the flow
afterRemove({resource})
```

- Example

```javascript

angular
 .module('app')
 .controller('{CONTROLLER_NAME}', {CONTROLLER_NAME});

function {CONTROLLER_NAME}($controller, {MODEL_SERVICE}) {
 var vm = this;

 vm.onActivate = onActivate;
 vm.applyFilters = applyFilters;

 $controller('CRUDController', { vm: vm, modelService: {MODEL_SERVICE}, options: {} });

 function onActivate() {
   vm.models = {MODEL_SERVICE}.listModels();
   vm.types = {MODEL_SERVICE}.listTypes();

   vm.queryFilters = { type: vm.types[0].id, model: vm.models[0].id };
 }

 function applyFilters(defaultQueryFilters) {
   return angular.extend(defaultQueryFilters, vm.queryFilters);
 }

}
```

> ### Directives ###

- __ContentHeader__

```html
<content-header title="" description="">
Header content
</content-header>
```

- __ContentBody__

```html
<content-body>
Body content
</content-body>
```

- __Box__
(important: the box directive must be inside a ContentBody)

> Simple Box

```html
<box box-title="{Box title}">
 Box content
</box>
```

> Box with toolbar and buttons in the footer

```html
<box box-title="{Box title}">
 <box-toolbar-buttons>
   Buttons box in the toolbar (Optional)
 </box-toolbar-buttons>
   Box content
 <box-footer-buttons>
   Buttons box in the footer (Optional)
 </box-footer-buttons>
</box>
```

- ( for more examples see **app/samples** )

> ### Components NgC2lib ###

- To know more about go to: [Git NgC2lib](git@gitlab.com:drypack/ngc2lib.git)

> ### Ícons ###

- the list of available icons to be used in the system can be founded at [Material Icons](https://design.google.com/icons/) and follow the standard below:

```html
<md-icon md-font-set="material-icons">
 3d_rotation
</md-icon>
```


## Production ##

- run the command **gulp --production**
   - This command put together, minifies the js and css files and inject them into the index.html
