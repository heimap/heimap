(function () {
    
      'use strict';
    
      angular
        .module('app')
        .controller('MapLeftSidenavController', MapLeftSidenavController);
    
      /** @ngInject */
      // eslint-disable-next-line max-params
      function MapLeftSidenavController($scope, $timeout, $mdSidenav, $log, $rootScope) {
        var vm = this;

        vm.close = function () {
          // Component lookup should always be available since we are not using `ng-if`
          $mdSidenav('left').close()
            .then(function () {
              $log.debug("close LEFT is done");
            });
    
        };

        $rootScope.$on('addToWorkingList', function (event, data) {
          console.log(data); // 'Some data'
        });
      }
    
    })();