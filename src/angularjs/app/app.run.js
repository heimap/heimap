(function() {
    'use strict';
  
    angular
      .module('app')
      .run(run);
  
    /** @ngInject */
    // eslint-disable-next-line max-params
    function run($rootScope, $state, $stateParams, Global) {
      //Sets the rootScope so it can be accessed in the views without the controller prefix
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;      
      $rootScope.global = Global;
    }
  }());
  