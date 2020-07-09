(function() {
  'use strict';

  angular
    .module('app')
    .factory('MapService', MapService);

  /** @ngInject */
  function MapService(serviceFactory) {
    var model = serviceFactory('/heimap/map/', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
