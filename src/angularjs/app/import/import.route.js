(function() {
  'use strict';

  angular
    .module('app')
    .config(routes);

  /**
   * Arquivo de configuração com as rotas específicas do recurso import
   *
   * @param {object} $stateProvider
   * @param {object} Global
   */
  /** @ngInject */
  function routes($stateProvider, Global) {
    $stateProvider
      .state('app.import', {
        url: '/import',
        templateUrl: Global.clientPath + '/import/import.html',
        controller: 'ImportController as importCtrl',
        data: { }
      });
  }
}());
