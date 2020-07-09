(function() {
  'use strict';

  angular
    .module('app')
    .config(routes);

  /**
   * Configuration file for map route
   *
   * @param {object} $stateProvider
   * @param {object} Global
   */
  /** @ngInject */
  function routes($stateProvider, Global) {
    $stateProvider
      .state('app.map', {
        url: '/map',
        templateUrl: Global.clientPath + '/map/map.html',
        controller: 'MapController as mapCtrl',
        data: { }
      });
  }
}());
