(function() {
  'use strict';

  angular
    .module('app')
    .config(routes);

  /**
   * Arquivo de configuração com as rotas específicas do recurso export
   *
   * @param {object} $stateProvider
   * @param {object} Global
   */
  /** @ngInject */
  function routes($stateProvider, Global) {
    $stateProvider
      .state('app.export', {
        url: '/export',
        templateUrl: Global.clientPath + '/export/export.html',
        controller: 'ExportController as exportCtrl',
        data: { }
      });
  }
}());
