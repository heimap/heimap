(function() {
  'use strict';

  angular
    .module('app')
    .config(routes);

  /**
   * Arquivo de configuração com as rotas específicas do recurso preferences
   *
   * @param {object} $stateProvider
   * @param {object} Global
   */
  /** @ngInject */
  function routes($stateProvider, Global) {
    $stateProvider
      .state('app.preferences', {
        url: '/preferences',
        templateUrl: Global.clientPath + '/preferences/preferences.html',
        controller: 'PreferencesController as preferencesCtrl',
        data: { }
      });
  }
}());
