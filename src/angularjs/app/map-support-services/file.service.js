(function () {
  'use strict';

  angular
    .module('app')
    .factory('FileService', FileService);

  /** @ngInject */
  function FileService(serviceFactory, $http, $q) {
    var endPoint = '/heimap/file';
    var model = serviceFactory(endPoint, {
      actions: {},
      instance: {
        upload: upload
      }
    });

    function upload() {
      var deferred = $q.defer();
      var formData = new FormData();
      formData.append('file', this.file);
      if(angular.isDefined(this.map_image_file_id) && this.map_image_file_id !== null) {
        formData.append('map_image_file_id', this.map_image_file_id);
      } 
      if(angular.isDefined(this.map_geo_file_projection) && this.map_geo_file_projection !== null) {
        formData.append('map_geo_file_projection', this.map_geo_file_projection);
      }

      $http.post(endPoint, formData, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    return model;
  }

}());