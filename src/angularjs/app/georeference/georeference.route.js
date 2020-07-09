(function() {
  'use strict';

  angular
    .module('app')
    .config(routes);

  /**
   * Configuration file for georeference route
   *
   * @param {object} $stateProvider
   * @param {object} Global
   */
  /** @ngInject */
  function routes($stateProvider, Global) {
    $stateProvider
      .state('app.georeference', {
        url: '/georeference',
        templateUrl: Global.clientPath + '/georeference/georeference.html',
        controller: 'GeoreferenceController as mapCtrl',
        data: { }
      });
  }
}());
