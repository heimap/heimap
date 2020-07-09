/*eslint angular/file-name: 0, no-undef: 0*/
(function() {
    'use strict';
  
    /**
     * Transforms external libs in angular services so we can use them with dependence injection
     */
    angular
      .module('app')
      .constant('lodash', _)
      .constant('moment', moment) 
      .constant('leaflet', L);
  }());
  