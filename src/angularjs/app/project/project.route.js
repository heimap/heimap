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
      .state('app.project', {
        url: '/project',
        templateUrl: Global.clientPath + '/project/project.html',
        controller: 'ProjectController as projectCtrl',
        data: { }
      });
  }
}());
