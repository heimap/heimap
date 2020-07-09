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
      .state('app.vector', {
        url: '/vector',
        templateUrl: Global.clientPath + '/vector/vector.html',
        controller: 'VectorController as mapCtrl',
        data: { }
      });
  }
}());
