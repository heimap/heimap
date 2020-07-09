(function() {
  'use strict';

  angular
    .module('app')
    .factory('PreferencesService', PreferencesService);

  /** @ngInject */
  function PreferencesService(serviceFactory) {
    var model = serviceFactory('preferences', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
