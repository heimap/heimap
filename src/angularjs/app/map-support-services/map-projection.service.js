(function () {
    'use strict';
  
    angular
      .module('app')
      .factory('MapProjectionService', MapProjectionService);
  
    /** @ngInject */
    function MapProjectionService(serviceFactory, $q) {     
      var model = serviceFactory('/heimap/map-projection', {
        actions: { },
        instance: { }        
      });
      return model;
    }
  
  }());