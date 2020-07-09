(function() {
  'use strict';

  angular
    .module('app')
    .factory('ImportService', ImportService);

  /** @ngInject */
  function ImportService(serviceFactory) {
    var model = serviceFactory('import', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
