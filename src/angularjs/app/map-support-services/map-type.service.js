(function () {
    'use strict';
  
    angular
      .module('app')
      .factory('MapTypeService', MapTypeService);
  
    /** @ngInject */
    function MapTypeService(serviceFactory, $q) {     
      var model = serviceFactory('/heimap/map-type', {
        actions: {},
        instance: {}
      });
      return model;
    }
  
  }());