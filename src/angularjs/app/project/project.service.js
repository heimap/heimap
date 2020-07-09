(function() {
  'use strict';

  angular
    .module('app')
    .factory('ProjectService', ProjectService);

  /** @ngInject */
  function ProjectService(serviceFactory) {
    var model = serviceFactory('export', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
