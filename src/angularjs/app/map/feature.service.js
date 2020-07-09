(function() {
  'use strict';

  angular
    .module('app')
    .factory('FeatureService', FeatureService);

  /** @ngInject */
  function FeatureService(serviceFactory) {
    var model = serviceFactory('/heimap/feature/', {
      actions: { },
      instance: { }
    });

    return model;
  }

}());
