(function() {
  'use strict';

  angular
    .module('app')
    .factory('GeoreferenceService', GeoreferenceService);

  /** @ngInject */
  function GeoreferenceService(serviceFactory, $http, $q) {
    var applyEndPoint = "/heimap/georef/apply";
    var previewGcpEndPoint = "/heimap/georef/rmse";

    var model = serviceFactory(applyEndPoint, {
      actions: { },
      instance: { 
        saveGeoRef: saveGeoRef,
        previewGCP: previewGCP
      }
    });

    function previewGCP(paramData) {
      // console.log(">>> GeoreferenceService >>> previewGCP ", previewGcpEndPoint, paramData);
      var deferred = $q.defer();
      var formData = new FormData();
      /* 
      paramData = {
          "imageCoordinates":{
            "m1":{
              "id":"m1",
              "lat":0.0067377090298955476,
              "lng":0.00429989455581481,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m1",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">1</div>"
              }
            },
            "m2":{
              "id":"m2",
              "lat":0.0003862380981423107,
              "lng":0.0029246218792744476,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m2",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">2</div>"
              }
            },
            "m3":{
              "id":"m3",
              "lat":0.0007295608520352782,
              "lng":0.012852371513050189,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m3",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">3</div>"
              }
            },
            "m4":{
              "id":"m4",
              "lat":0.006051063526346111,
              "lng":0.01096137158280719,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m4",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">4</div>"
              }
            }
          },
          "worldCoordinates":{
            "m1":{
              "id":"m1",
              "lat":49.360911547126165,
              "lng":8.03715297154017,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m1",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">1</div>"
              }
            },
            "m2":{
              "id":"m2",
              "lat":48.832181625698475,
              "lng":7.998645336597,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m2",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">2</div>"
              }
            },
            "m3":{
              "id":"m3",
              "lat":48.85387273165656,
              "lng":9.049353661475235,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m3",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">3</div>"
              }
            },
            "m4":{
              "id":"m4",
              "lat":49.47883244071047,
              "lng":9.203384201247957,
              "focus":true,
              "draggable":true,
              "icon":{
                "type":"div",
                "className":"mk-div-icon m4",
                "iconSize":null,
                "html":"<div class=\"mk-icon-container mk-ok\">4</div>"
              }
            }
          },
          "rectifyMethod":"1stOrderPolyn",
          "resamplingMethod":"near",
          "mapId":"23",
          "newFileName":"1_g_1stOrderPolyn_near_7.19.2018",
          "bboxCropImage":"7.998645336597 48.832181625698475 9.203384201247957 49.47883244071047"
        }
       */
      $http.post(previewGcpEndPoint, paramData).then(function (result) {
        deferred.resolve(result.data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    // not used
    function saveGeoRef() {
      console.log(">>> GeoreferenceService >>> saveGeoRef ", this.applyEndPoint);

      var deferred = $q.defer();
      var formData = new FormData();
      
      $http.post(this.applyEndPoint, formData, {
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
