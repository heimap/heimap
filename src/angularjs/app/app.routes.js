(function() {
    'use strict';
  
    angular
      .module('app')
      .config(routes);
  
    /** @ngInject */
    function routes($stateProvider, $urlRouterProvider, Global) {  
        $stateProvider
        .state('app', {            
            templateUrl: Global.clientPath + '/shared/partials/app.html',           
            abstract: true,            
            resolve: { //ensure langs is ready before render view
              translateReady: ['$translate', '$q', function($translate, $q) {
                var deferred = $q.defer();
    
                $translate.use('en-GB').then(function() {
                  deferred.resolve();
                });
    
                return deferred.promise;
              }]
            }         
        })            
    
        $urlRouterProvider.when('/app', Global.homeUrl);        
        $urlRouterProvider.otherwise(Global.homeUrl);
    }
  }());
  