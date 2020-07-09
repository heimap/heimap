(function () {
    'use strict';
  
    angular
      .module('app')
      .factory('MapProjectService', MapProjectService);
  
    /** @ngInject */
    function MapProjectService(serviceFactory, $q) {     
      var model = serviceFactory('/heimap/map-project', {
        actions: { },
        instance: { }        
      });
      return model;
    }
  
  }());