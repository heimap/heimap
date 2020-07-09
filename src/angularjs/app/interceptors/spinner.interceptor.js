(function () {
    'use strict';
  
    angular
      .module('app')
      .config(spinnerInterceptor);
  
    function spinnerInterceptor($httpProvider, $provide) {
      /**
       * This interceptor is responsible for showing and hiding the C2Spinner
       * when a async request is started/ended
       *
       * @param {any} $q
       * @param {any} $injector
       * @returns
       */
      function showHideSpinner($q, $injector, Global) {
  
        /**
         * Current pending requests
         */
        Global.pendingRequests = 0;
        
        return {
          request: function (config) {
            Global.pendingRequests++;
            $injector.get('C2Spinner').show();                 
            return config;
          },
  
          response: function (response) {
            Global.pendingRequests--;  
            // the spinner is only hidden if there are no more  pending requests      
            if (Global.pendingRequests === 0) {
              $injector.get('C2Spinner').hide();
            }       
            return response;
          },
  
          responseError: function (rejection) {
            Global.pendingRequests--;  
            // the spinner is only hidden if there are nomore  pending requests      
            if (Global.pendingRequests === 0) {
              $injector.get('C2Spinner').hide();
            }  
            return $q.reject(rejection);
          }
        };
      }
  
      // Define a factory to the $httpInterceptor
      $provide.factory('showHideSpinner', showHideSpinner);
  
      // Push the new factory onto the $http interceptor array
      $httpProvider.interceptors.push('showHideSpinner');
    }
  }());
  