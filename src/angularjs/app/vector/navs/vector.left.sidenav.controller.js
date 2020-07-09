(function () {

  'use strict';

  angular
    .module('app')
    .controller('VectorLeftSidenavController', VectorLeftSidenavController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function VectorLeftSidenavController(Global, $mdSidenav, $mdDialog, $window, lodash, $rootScope, C2Dialog, C2Toast, $translate, $state, leaflet, leafletData, $sessionStorage, VectorService, MapLayerService) {
    var vm = this;

    vm.layerClicked = layerClicked;
    vm.activateFeatureEdit = activateFeatureEdit;
    vm.deleteLayer = deleteLayer;
    vm.openAttributePopUp = openAttributePopUp;
    vm.layerVisibility = layerVisibility;
    vm.createLayer = createLayer;
    vm.save = save;
    vm.toggleLeft = toggleLeft;
    vm.exportLayer = exportLayer;
    vm.userAllow = userAllow;
    vm.drawControl = null; // toolbar control
    vm.drawnItems = null;
    vm.layers = [];
    vm.leafletLayers = [];
    vm.currentlyEditingLayer = null;
    vm.editMode = null;
    
    // Called from right side nav for adding newly created feature to leaflet layer
    $rootScope.$on('addFeatureToLayer', function(event, args){
      // console.log(">>> VectorLeftSidenavController >>> addFeatureToLayer ", args);
      // leaflet.geoJSON(args, {}).addTo(vm.drawnItems);
      vm.drawnItems.addLayer(args);
      leafletData.getMap('leftMapViewer').then(function (map) {
        vm.drawnItems.addTo(map);
      });
    });

    /**
     * First function called after the controller is ran
     * here the stuff are initialized
     * 
     */
    function activate() {
      // console.log(">>> ge.left.sidenav.controller >>> activate ");
      if(! lodash.isEmpty($sessionStorage.getObject("projId").toString())) {
        var projId = $sessionStorage.getObject("projId").toString();
        var layerService = new VectorService();
        var reqParamData = { 
          proj_id: projId,
          user_id: $sessionStorage.getObject("userId").toString(),
          fetch: 'allLayers'
        };
        layerService.getVectorLayers(reqParamData)
          .then(function(result){
            lodash.forEach(result, function(layer) {
              layer.layerName = "vertex_proj_id_"+ projId +"_layer_id_"+ layer.layer_id +"_latest"
              // load WFS layers from Geoserver
              loadWFSLayers(layer);
            });
          }, function(err){
            console.log(err)
          });
      }

      // handle feature creation on map
      leafletData.getMap('leftMapViewer').then(function (map) {
        if(typeof vm.drawnItems !== "undefined") {
          // added this bloc of code for letting user get feature-info without entering edit-mode
          if(vm.drawnItems === null) {
            vm.drawnItems = new leaflet.FeatureGroup();
          }
          vm.drawnItems.on('click', onFeatureClicked);
          // vm.drawnItems.addTo(map);
          // map.addLayer(vm.drawnItems);
          // ----------------------
          if($state.current.name === "app.vector") {
            map.on('draw:created', function (e) {
              var leafLayer = e.layer;
              // vm.drawnItems.addLayer(leafLayer);
              var drawsGeoJson = leafLayer.toGeoJSON();
              vm.editMode = "add";
              // openAttributePopUp(drawsGeoJson, vm.currentlyEditingLayer, vm.editMode, e);
              openAttributePopUp(leafLayer, vm.currentlyEditingLayer, vm.editMode, e);
            }.bind(vm.drawnItems));
            map.on('draw:editstart', function (e) {
              //  console.log(">>> draw:editstart ");
              vm.editMode = "edit-Geom";
              //  vm.drawnItems.off('click', onFeatureClicked);
            }.bind(vm.drawnItems));
            map.on('draw:editstop', function (e) {
              // console.log(">>> draw:editstop ");
              vm.editMode = null;
            }.bind(vm.drawnItems));
            map.on('draw:edited', function (e) {
              // console.log(">>> draw:edited ");
              var layers = e.layers;
              /* layers.eachLayer(function (layer) {
                  // console.log(layer);
                  // replace feature geom with the new editted geom value
                  layer.feature.geometry.coordinates = Object.values(layer.getLatLng());
                  $rootScope.$broadcast("addFeatureToUpdate", layer.feature);
              }); */
              $rootScope.$broadcast("geomUpdated", layers);
            });
            map.on('draw:deletestart', function (e) {
              // console.log(">>> draw:deletestart ");
              vm.editMode = "delete";
            }.bind(vm.drawnItems));
            map.on('draw:deletestop', function (e) {
              // console.log(">>> draw:deletestop ");
              vm.editMode = null;
            }.bind(vm.drawnItems));
            map.on('draw:deleted', function (e) {
              // console.log(">>> draw:deleted ");
              var layers = e.layers;
              prepareDeleteParams(layers);
           });
          }
        }
      });
    }

    function onFeatureClicked(e) {
      // console.log(">>> onFeatureClicked >>> ", e);
      if(!(vm.editMode === "edit-Geom" || vm.editMode === "delete")) {
        // expects only a single feature
        $rootScope.$broadcast("showFeatureAttr", e.layer.feature);
      }
    }

    function createLayer() {
      // console.log(">>> ge.left.sidenav.controller >>> createLayer");
      close();
      var config = {
        locals: {
          mapDialogInput: {
            // model: resource,
            removeFn: vm.remove
          }
        },
        controller: 'VectorLayerController',
        controllerAs: 'ctrl',
        templateUrl: Global.clientPath + '/vector/dialog/vectorLayer.html',
        hasBackdrop: false
      };

      C2Dialog.custom(config).then(function () {
        // reload the items from back-end
        // vm.search();
        // console.log("save done");
      });
    }

    function layerClicked(layer) {
      if($sessionStorage.getObject("role").toString() !== "4") {
        console.log(">>> vector.left.sidenav.controller >>> layerClicked ", layer);
        close();
        var config = {
          locals: {
            mapDialogInput: {
              model: layer
              // removeFn: vm.remove
              // mode: 'edit'
            }
          },
          controller: 'VectorLayerController',
          controllerAs: 'ctrl',
          templateUrl: Global.clientPath + '/vector/dialog/vectorLayer.html',
          hasBackdrop: false
        };

        C2Dialog.custom(config).then(function () {
          // reload the items from back-end
          // vm.search();
          // console.log("save done");
        });
      }
    }

    /**
     * Activate Edit toolbar for particular layer
     * 
     * @param {any} layer 
     */
    function activateFeatureEdit(layer) {
      // console.log(">>> vector.left.sidenav.controller >>> activateFeatureEdit ", layer);

      leafletData.getMap('leftMapViewer').then(function (map) {
        if(vm.drawControl !== null) {
          vm.drawControl.remove();
          vm.drawControl = null;
          if(angular.isDefined(vm.drawnItems)) {
            vm.drawnItems = null;
          }
        }
        if(vm.drawControl === null) {
          // vm.drawnItems = new leaflet.FeatureGroup();
          // vm.drawnItems.on({
          //   'click': function (e) {
          //     // expects only a single feature
          //     $rootScope.$broadcast("showFeatureAttr", e.layer.feature);
          //   }
          // })
          // adding current layers features to drawnItems
          // lodash.forEach(layer.getLayers(), function(eachFeature) {
          //   // console.log(">>> eachFeature ", eachFeature);
          //   // eachFeature.editing.enable();
          //   eachFeature.addTo(vm.drawnItems);
          // });
          // vm.drawnItems.addTo(map);
          // map.addLayer(vm.drawnItems);
          // 
          vm.drawnItems = new leaflet.FeatureGroup();
          // adding current layers features to drawnItems
          lodash.forEach(layer.getLayers(), function(eachFeature) {
            // console.log(">>> eachFeature ", eachFeature);
            // eachFeature.editing.enable();
            // check is role is 3, if so than check if the feature's user is the same as logged in user
            if(eachFeature.feature.properties.layerName === layer.layerId) {
              // console.log("before adding to drawnitems ", eachFeature.feature);
              if($sessionStorage.getObject("role").toString() === "3") {
                if(eachFeature.feature.properties.user_id === $sessionStorage.getObject("userId")) {
                  eachFeature.addTo(vm.drawnItems);  
                  vm.drawnItems.addTo(map);
                }
              } else {
                eachFeature.addTo(vm.drawnItems);
                vm.drawnItems.addTo(map);
              }
            }
          });
          vm.drawControl = new leaflet.Control.Draw({
            draw: {
              polygon: true,
              polyline: true,
              rectangle: false,
              circle: false,
              marker: true,
              circlemarker: false
            },
            edit: {
                    featureGroup: vm.drawnItems
            },
            position: 'topright'
          });
          map.addControl(vm.drawControl);
        }
        // set the currently editing layer
        vm.currentlyEditingLayer = layer;
        $rootScope.$broadcast("setCurrentEditLayer", { data : { layer : vm.currentlyEditingLayer }});
        close();
      });
    }
  
    function addNonGroupLayers(sourceLayer, targetGroup) {
      if (sourceLayer instanceof L.LayerGroup) {
        sourceLayer.eachLayer(function (layer) {
          addNonGroupLayers(layer, targetGroup);
        });
      } else {
        targetGroup.addLayer(sourceLayer);
      }
    }

    /**
     * Removes the layer from map and deletes it from our collection
     * 
     * @param {any} layer 
     */
    function deleteLayer(layer) {
      // console.log(">>> vector.left.sidenav.controller >>> deleteLayer ", layer);
      // check for draw control
      // if(vm.drawControl !== null) {
      //   vm.drawControl.remove();
      //   vm.drawControl = null;
      //   if(angular.isDefined(vm.drawnItems)) {
      //     console.log("vm.drawnItems = ", vm.drawnItems);
      //     vm.drawnItems = null;
      //   }
      // }

      // // clean features from map i.e remove layer from map
      // leafletData.getMap('leftMapViewer').then(function (map) {
      //   map.removeLayer(layer);
      // });

      // vm.leafletLayers = lodash.reject(vm.leafletLayers, function(layerToDelete) { 
      //   if(leaflet.stamp(layerToDelete) === leaflet.stamp(layer)) {
      //     return true;
      //   }
      // });
      // console.log("After deleteing ", vm.leafletLayers);

      var confirm = $mdDialog.confirm()
            .title($translate.instant('messages.deleteLayerTitle'))
            .textContent($translate.instant('messages.deleteLayerMessage'))
            .ariaLabel('Lucky day')
            // .targetEvent(ev)
            .ok($translate.instant('messages.yes'))
            .cancel($translate.instant('messages.no'));

      $mdDialog.show(confirm).then(function() {
        // $scope.status = 'You decided to get rid of your debt.';
        var reqParam = {
          "action": "deleteLayers",
          "data": [{
            "layer_id": layer.layerId,
            "user_id": sessionStorage.getItem("userId"),
            "proj_id": sessionStorage.getItem("projId")
          }]
          };
        // call delete API and state.reload
        var vectorService = new VectorService();
        vectorService.deleteVectorLayer(reqParam)
          .then(function(res){
            if(res === "success") {
              $state.reload();
              C2Toast.success($translate.instant('messages.operationSuccess'));
            } else {
              C2Toast.success($translate.instant('messages.operationError'));
            }
          }, function(err){
            console.log("Error while deleting ",err);
        });
      }, function() {
        // console.log("Deleting Layer Cancelled");
      });
      
    }

    /**
     * Accepts array of layer names and fires WFS calls to load them as WFS layer
     * Generates an array of layer list "leafletLayers" which maintains a list of layers added to map
     * 
     * @param [{any}] layers 
     */
    function loadWFSLayers(layer) {
      // console.log(">>> vector.left.sidenav.controller >>> loadWFSLayers ", layer, MapLayerService.serverConfig.base_ows_url);
      // lodash.forEach(layers, function(layer) {
        // console.log("calling geoserver for layer = ", layer);
        leafletData.getMap('leftMapViewer').then(function (map) {
          // MapLayerService.addWFSLayer(layer.layerName, 'leftMapViewer');
          // create layer objects and keep it in vm.layers list 
          var tempLayer = new leaflet.WFST({
            // url: 'http://0.0.0.0:8081/geoserver/ows',
            url: MapLayerService.serverConfig.base_ows_url.substring(0, MapLayerService.serverConfig.base_ows_url.length - 1),
            typeNS: 'vector',
            typeName: layer.layerName,
            // crs: leaflet.CRS.EPSG4326,
            geometryField: 'the_geom',
            style: {
              color: "#"+((1<<24)*Math.random()|0).toString(16),
              // weight: 1,
            },
            fillOpacity:0.2
          }, new leaflet.Format.GeoJSON({
            crs: leaflet.CRS.EPSG4326/* ,
            pointToLayer(geoJsonPoint, latlng) {
              const layer = new L.CircleMarker(latlng, {
                radius: 10,
              });
              return layer;
            }, */
          })).addTo(map)
            .on('load', function () {
              // map.fitBounds(tempLayer.getLayers()[0].getBounds());
              if(tempLayer.getBounds().isValid()) {
                map.fitBounds(tempLayer.getBounds());
              }
              tempLayer.visible = true;
              tempLayer.layerName = "vertex_proj_id_"+ sessionStorage.getItem("projId") +"_layer_id_"+ layer.layer_id +"_latest";
              tempLayer.title = layer.title;
              tempLayer.layerId = layer.layer_id;
              tempLayer.desc = layer.description;
              // store in my collection to be used 
              vm.leafletLayers.push(tempLayer);

              lodash.forEach(tempLayer.getLayers(), function(eachFeature) {
                // console.log(">>> eachFeature ", eachFeature, layer.layer_id);
                eachFeature.feature.properties.layerName = layer.layer_id;
                eachFeature.addTo(vm.drawnItems);
              });  
            });
        });
      // });
    }

    function openAttributePopUp(featureGeojson, layer, mode, ev) {
      // console.log(">>> vector.left.sidenav.controller >>> openAttributePopUp ", featureGeojson, layer);
      $rootScope.$broadcast("openRightNav", /* FeatureService.createObjectFromGeoJson(layer.feature) */
      { data:{ 
          layer: layer, 
          layerId: layer.layerId, 
          feature: featureGeojson, 
          operation: "create",
        }
      });

    }

    /**
     * Changes the visibilty of a layer
     * 
     * @param {any} layer 
     */
    function layerVisibility(layer) {
      // console.log(">>> layerVisibility ", layer, layer.visible);
      leafletData.getMap('leftMapViewer').then(function (map) {
        // console.log(">>> layerVisibility >>> ", map);
        if(layer.visible) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      });
    }

    function prepareDeleteParams(features) {
      
      $rootScope.$broadcast("featureDeleted", 
        { data:{ 
            features: features,
            operation: "delete",
          }
        });
    }

    function getLayerByName(layerName) {
      console.log(">>> getLayerByName >>> ", layerName);
      leafletData.getMap('leftMapViewer').then(function (map) {
        map.eachLayer(function(layer){
          console.log("each layer = ", layer);
        });
      });
    }

    /**
     * Close this sidenav
     * 
     */
    function close () {
      $mdSidenav('left').close();
    }    

    /**
     * Open this sidenav
     * 
     */
    function open () {
      $mdSidenav('left').open();
    }

    /**
     * Main function which send the Modifications to server
     * 
     */
    function save() {
      // console.log(">>> VectorLeftSidenavController >>> save ");
      var reqParam = {
          "action": "createFeatures",
          "user_id": $sessionStorage.getObject("userId"),
          "proj_id": $sessionStorage.getObject("projId"),
          "role": $sessionStorage.getObject("role"),
          "data": []
      };
      var createParam = {
        "action": "create",
        "data":[]
      };
      var editParam = {
        "action": "edit",
        "data": []
      };
      var deleteParam = {
        "action": "delete",
        "data": []
      };
      if(angular.equals($sessionStorage.getObject("createParam"), {})) {
        reqParam.data.push(createParam);
      } else {
        reqParam.data.push($sessionStorage.getObject("createParam"));
      }
      if(angular.equals($sessionStorage.getObject("editParam"), {})) {
        reqParam.data.push(editParam);
      } else {
        reqParam.data.push($sessionStorage.getObject("editParam"));
      }
      if(angular.equals($sessionStorage.getObject("deleteParam"), {})) {
        reqParam.data.push(deleteParam);
      } else {
        reqParam.data.push($sessionStorage.getObject("deleteParam"));
      }
      // console.log("reqParam = ", reqParam);

      var layerService = new VectorService();
      layerService.createFeatures(reqParam)
        .then(function(result){
          // console.log("saved in API ", result);
          if(result === "success") {
            C2Toast.success($translate.instant('messages.saveSuccess'));
            // console.log("saved in API ", result);
            $sessionStorage.remove("createParam");
            $sessionStorage.remove("editParam");
            $sessionStorage.remove("deleteParam");
            $state.reload();
          } else {
            C2Toast.error($translate.instant('messages.saveError'));
          }
      }, function(err){
          console.log("Error while saving ",err);
          $sessionStorage.remove("createParam");
          $sessionStorage.remove("editParam");
          $sessionStorage.remove("deleteParam");
      });
    }

    /**
     * Open/close the left side nav
     * 
     */
    function toggleLeft() {
      $mdSidenav('left').toggle();
    }

    /**
     * Export layer data as GeoJSON in a file
     * 
     */
    function exportLayer(layer) {
      // console.log(">>> leftSideNav >>> exportLayer ", layer);
      // $window.open("/heimap/vector?proj_id="+
      //   $sessionStorage.getObject("projId") +
      //   "&layer_id="+ layer.layerId +"&fetch=latestVersion",
      //   "_blank");

      var reqParam = {
        "user_id": $sessionStorage.getObject("userId"),
        "role": $sessionStorage.getObject("role"),
        "layer_id": layer.layerId,
        "proj_id": $sessionStorage.getObject("projId"),
        "fetch": "latestVersion"
      };
      
      var layerService = new VectorService();
      layerService.exportLayerGeoJson(reqParam)
        .then(function(result){
          // console.log("exportLayerGeoJson ", result);
          var layerData = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(JSON.stringify(result));
          var downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", layerData);
          downloadAnchorNode.setAttribute("download", "layer.json");
          document.body.appendChild(downloadAnchorNode); // required for firefox
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
      }, function(err){
          console.log("Error while saving ",err);
      });
    }

    /**
     * Check functionality is allowed for a user based on his role
     * 
     * @returns boolean
     */
    function userAllow(functionality) {
      if(functionality === "featureEdit") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
      if(functionality === "layerCreate") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
      if(functionality === "layerEdit") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
      if(functionality === "layerDelete") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
      if(functionality === "layerExport") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
      if(functionality === "publishData") {
        if(sessionStorage.getItem("role").toString() === "1") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "2") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "3") {
          return true;
        } else if(sessionStorage.getItem("role").toString() === "4") {
          return false;
        }
      }
    }

    activate();
    
  }

})();