(function() {
  'use strict';

  angular
    .module('app')
    .factory('ExportService', ExportService);

  /** @ngInject */
  function ExportService(serviceFactory) {
    var model = serviceFactory('export', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
