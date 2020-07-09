/*eslint angular/file-name: 0*/
(function() {
  'use strict';

  angular
    .module('app')
    .factory('serviceFactory', serviceFactory);

  /** @ngInject */
  /**
   * More information:
   * https://github.com/swimlane/angular-model-factory/wiki/API
   */
  function serviceFactory($modelFactory) {
    return function(url, options) {
      var model;
      var defaultOptions = {
        actions: {
          /**
           * Action to do a paginated search
           * Expects that a json object with the properties items and total
           */
          paginate: {
            method: 'GET',
            isArray: false,
            wrap: false,
            afterRequest: function(response) {
              if (response['items']) {
                response['items'] = model.List(response['items']);
              }

              return response;
            }
          }
        }
      };

      model = $modelFactory(url, angular.merge(defaultOptions, options))

      return model;
    }
  }
})();
