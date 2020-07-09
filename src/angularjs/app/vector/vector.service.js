(function() {
  'use strict';

  angular
    .module('app')
    .factory('VectorService', VectorService);

  /** @ngInject */
  function VectorService(serviceFactory, $http, $q) {
    var getVectorLayersUrl = "/heimap/vector/layers"

    var model = serviceFactory(getVectorLayersUrl, {
      actions: { },
      instance: { 
        getVectorLayers: getVectorLayers,
        createVectorLayers: createVectorLayers,
        createFeatures: createFeatures,
        editVectorLayers: editVectorLayers,
        deleteVectorLayer: deleteVectorLayer,
        getAllFeatureVersion: getAllFeatureVersion,
        getFormData: getFormData,
        exportLayerGeoJson: exportLayerGeoJson
      }
    });

    function getVectorLayers(paramData) {
      // console.log(">>> VectorService >>> getVectorLayers ", previewGcpEndPoint, paramData);
      // http://localhost:8080/heimap/vector?user_id=112345&proj_id=312344&fetch=allLayers
      var getLayerUrl = "/heimap/vector";
      var deferred = $q.defer();
      
      $http({
        method: 'GET',
        url: getLayerUrl,
        params: paramData
      }).then(function successCallback(response) {
          // console.log("response ", response);
          deferred.resolve(response.data.items);
        }, function errorCallback(response) {
          deferred.reject(response);
        });

      return deferred.promise;
    }

    function createVectorLayers(paramData) {
      // console.log(">>> VectorService >>> createVectorLayers ", paramData);
      var createLayerUrl = "/heimap/vector/layer";
      var deferred = $q.defer();

      $http.post(createLayerUrl, paramData).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function createFeatures(paramData) {
      var createFeatureUrl = "/heimap/vector/feature";
      var deferred = $q.defer();
      
      $http.post(createFeatureUrl, paramData).then(function successCallback(response) {
          deferred.resolve(response.data);
        }, function errorCallback(response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }

    function deleteVectorLayer(paramData) {
      var delLayerUrl = "/heimap/vector/layer";
      var deferred = $q.defer();
      
      $http.post(delLayerUrl, paramData)
        .then(function successCallback(response) {
          deferred.resolve(response.data);
        }, function errorCallback(response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }

    function editVectorLayers(paramData) {
      var editLayerUrl = "/heimap/vector/layer";
      var deferred = $q.defer();
      
      $http.post(editLayerUrl, paramData)
        .then(function successCallback(response) {
          deferred.resolve(response.data);
        }, function errorCallback(response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }

    function getAllFeatureVersion(paramData) {
      var getAllVersionUrl = "/heimap/vector";
      var deferred = $q.defer();
      
      $http({
        method: 'GET',
        url: getAllVersionUrl,
        params: paramData
      }).then(function successCallback(response) {
          // console.log("response ", response);
          deferred.resolve(response.data.items);
        }, function errorCallback(response) {
          deferred.reject(response);
        });

      return deferred.promise;
    }

    function getFormData(paramData) {
      var getFormUrl = "/heimap/feature-source-type";
      var deferred = $q.defer();
      
      $http({
        method: 'GET',
        url: getFormUrl,
        params: paramData
      }).then(function successCallback(response) {
          // console.log("response ", response);
          deferred.resolve(response.data.items);
        }, function errorCallback(response) {
          deferred.reject(response);
        });
        // deferred.resolve([
        //   {"name":"buildingType","required":false,"type":"text","order":1,"placeholder":"buildingType","dependent":"buildingType"},
        //   {"name":"country","required":false,"type":"text","order":3,"placeholder":"country","dependent":"country"},
        //   {"name":"state","required":false,"type":"text","order":2,"placeholder":"state","dependent":"country"},
        //   {"name":"king","required":false,"type":"text","order":4,"placeholder":"king","dependent":"king"},
        //   {"name":"city","order":5,"placeholder":"city","dependent":"country","type":"select","options":[{"order":0,"name":"mumbai","value":"mumbai"},{"order":1,"name":"heidelberg","value":"heidelberg"}]},
        //   {"name":"language","order":6,"placeholder":"language","type":"multiple","dependent":"language","options":[{"order":0,"name":"english","value":"english"},{"order":1,"name":"german","value":"german"}],"value":["english"]},
        //   {"name":"description","order":7,"type":"textarea","placeholder":"description","value":"","dependent":"description","required":false}
        // ]);

      return deferred.promise;
    }

    function exportLayerGeoJson(paramData) {
      var exportUrl = "/heimap/vector";
      var deferred = $q.defer();
      
      $http({
        method: 'GET',
        url: exportUrl,
        params: paramData
      }).then(function successCallback(response) {
          // console.log("response ", response);
          deferred.resolve(response.data);
        }, function errorCallback(response) {
          deferred.reject(response);
        });

      return deferred.promise;
    }

    return model;
  }

}());
