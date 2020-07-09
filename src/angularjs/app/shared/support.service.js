(function () {
  'use strict';

  angular
    .module('app')
    .factory('SupportService', SupportService);

  /** @ngInject */
  function SupportService(serviceFactory, $http, $q, Global) {
    var endPoint = '/heimap/support';
    var model = serviceFactory(endPoint, {
      actions: {
        config: {
          method: 'GET',
          isArray: false,
          wrap: false,
          url: 'config',
          afterRequest: function(response) {
            if(response.drupal_app_url) {
              Global.dashboardUrl = response.drupal_app_url;
            }
            return response;
          }
        }
      },
      instance: {}
    });
    
    return model;
  }

}());