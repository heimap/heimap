/**
 * Map Layer Service responsible for building basic layers, managing the state of the right and left viewers 
 * and its layers, as well as basic interactions supported by leaflet, like change opacity, reorder etc.
 * 
 * As a centralized service this service execute actions and broadcast events when the state changes
 * The following events are broadcasted:
 * 
 * ungeoreferencedLayerToBeLoaded
 * georeferencedLayerToBeLoaded
 * mapLayersChanged
 * addedMapLayer
 * removedMapLayer
 * removedAllMapLayers
 * mapHidden
 * mapShown
 * viewerHidden
 * viewerShown
 * mapLayersReordered
 * addedMapDraw
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapLayerService', MapLayerService);


  function MapLayerService(leafletData, leaflet, lodash, SupportService, $rootScope, $q, $timeout) {
    var service = {
      buildDefaultLayers: buildDefaultLayers,
      addMapLayer: addMapLayer,
      removeMapLayer: removeMapLayer,
      hideMap: hideMap,
      showMap: showMap,
      // addMapLayer: addMapLayer,
      serverConfig: null,
      isAdded: isAdded,
      fitMapBounds: fitMapBounds,
      applyOpacity: applyOpacity,
      hasNonGeoreferencedLayer: hasNonGeoreferencedLayer,
      removeAllMapLayers: removeAllMapLayers,
      getViewerOverlays: getViewerOverlays,
      getViewerData: getViewerData,
      getDefaultCenter: getDefaultCenter,
      refreshMapResource: refreshMapResource,
      hideViewer: hideViewer,
      showViewer: showViewer,
      applyReorder: applyReorder,
      setWheelZoomStatus: setWheelZoomStatus,
      getViewerDraws: getViewerDraws,
      getOverlaysCountBool: getOverlaysCountBool,
      addWFSLayer: addWFSLayer
    };

    /**
     * Private property that stores the base layers / overlays 
     *  
     */
    var serviceData = {};

    /**
     * Get the viewer overlays
     * 
     * @param {any} viewerId 
     * @returns {}
     */
    function getViewerOverlays(viewerId) {
      var viewerData = getViewerData(viewerId);      
      var overlays = angular.copy(viewerData.overlays);    
      if (overlays && angular.isDefined(overlays.draw)) {
        delete overlays.draw;
      }
      return overlays;
    }

    /**
     * Get the viewer draws
     * 
     * @param {any} viewerId 
     * @returns {}
     */
    function getViewerDraws(viewerId) {
      var viewerData = getViewerData(viewerId);      
      var overlays = angular.copy(viewerData.overlays);    
      if (overlays && angular.isDefined(overlays.draw)) {
        return overlays.draw;
      }     
    }

    /**
     * Set the mouse wheel scroll zoom control as enabled/disabled for a certain viewer
     * 
     * @param {string} viewerId 
     * @param {boolean} enabled
     * @returns void
     */
    function setWheelZoomStatus(viewerId, enabled){
      leafletData.getMap(viewerId).then(function (map) {
        if(enabled === true){
          map.scrollWheelZoom.enable();
        } else {
          map.scrollWheelZoom.disable();
        }        
      });
    }

    /**
     * Get boolean. True if there are no overlays added.
     * 
     * 
     * 
     */
    function getOverlaysCountBool(){
      if (Object.values(serviceData)[0]["overlays"] == undefined && 
          Object.values(serviceData)[1]["overlays"] == undefined){
        return true
      } else { return false }
    }


    /**
     * Get view data by viewer ID
     * 
     * @param {any} viewerId 
     * @returns {}
     */
    function getViewerData(viewerId) {
      viewerId = parseMapViewerId(viewerId);
      if (viewerId in serviceData) {
        return serviceData[viewerId];
      }
      return {}
    }

    /**
     * Build the default base layers
     * @param {} options
     */
    function buildDefaultLayers(options) {
      options = angular.isUndefined(options)? {} : options;

      SupportService.config().then(
        function (response) {
          service.serverConfig = response;
        }
      );

      serviceData.leftMapViewer = {
        baselayers: getBaseLayers()        
      }

      if(options.supportDrawing){
        serviceData.leftMapViewer.overlays = 
        {
          draw: {
            name: 'draw',
            type: 'group',
            visible: true,
            layerParams: {
              showOnSelector: false
            }
          }
        }
      }
      // At the beginning both map layers are equal
      serviceData.rightMapViewer = angular.copy(serviceData.leftMapViewer);
      listenAndApplyDraw();
    }

    /**
     * Apply draw as new layer on draw
     * 
     */
    function listenAndApplyDraw() {
      function keepDraw(viewerId){
        leafletData.getMap(viewerId).then(function (map) {
          leafletData.getLayers(viewerId).then(function (baselayers) {
            // console.log("baselyer = ", baselayers);
            var drawnItems = baselayers.overlays.draw;
            // added condition to handle rectangle selection for Georef
            if(typeof drawnItems !== "undefined") {
              map.on('draw:created', function (e) {
                var layer = e.layer;
                drawnItems.addLayer(layer);
                var drawsGeoJson = layer.toGeoJSON();
                // broadcast the events
                $rootScope.$broadcast('mapLayersChanged');
                $rootScope.$broadcast('addedMapDraw', drawsGeoJson);              
              }.bind(drawnItems));
          }
          });
        });
      }
      keepDraw('leftMapViewer');
      keepDraw('rightMapViewer');
    }

    /**
     * Get the default center for a layer
     */
    function getDefaultCenter() {
      // Heidelberg, Germany
      return {
        lat: 49.399228,
        lng: 8.680522,
        zoom: 8
      }
    }

    /**
     * Get the base layers
     */
    function getBaseLayers() {
      return {
        xyz: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz',
          opacity: 1,
          layerOptions: {
            zIndex: 0
          }
        },
        bingAerial: {
          name: 'Aerial',
          type: 'bing',
          key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
          layerOptions: {
            type: 'Aerial',
            opacity: 1,
            zIndex: 0
          }
        },
        bingRoad: {
          name: 'Road',
          type: 'bing',
          key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
          layerOptions: {
            type: 'Road',
            opacity: 1,
            zIndex: 0
          }
        },
        bingAerialWithLabels: {
          name: 'Aerial With Labels',
          type: 'bing',
          key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
          layerOptions: {
            type: 'AerialWithLabels',
            opacity: 1,
            zIndex: 0
          }
        },
      }
    }

    /**
     * Build an additional overlays
     * @param {} resource 
     */
    function buildMapOverlay(resource) {
      var layer = {
        name: resource.title,
        type: 'wms',
        visible: true,
        url: service.serverConfig.base_ows_url,
        layerParams: {
          layers: resource.geoserver_layer_id,
          format: 'image/png',
          transparent: true,
          opacity: 0.7
        },
        layerOptions: {
          opacity: 0.7,
          tiled: true
        },
        resource: resource
      }
      return layer;
    }

    /**
     * Fit the map view to the bounds of a layer
     * @param object resource 
     * @param string mapComponentId 
     */
    function fitMapBounds(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      leafletData.getMap(viewerId).then(function (map) {
        var bounds = [
          [resource.map_top_left_long, resource.map_top_left_lat],
          [resource.map_right_bottom_long, resource.map_right_bottom_lat]
        ];
        map.fitBounds(bounds);
      });
    }

    /**
     * Apply the layer defined opacity or the value defined in the layer transparency property
     * @param {} layer 
     * @param string viewerId 
     */
    function applyOpacity(layer) {
      leafletData.getLayers(layer.viewerId).then(function (layers) {
        var overlayId = parseMapOverlayId(layer.viewerId, layer.resource);
        layers.overlays[overlayId].setOpacity(layer.layerParams.opacity);
      });
    }

    /**
     * Add a map as a layer to the maps (left and right)
     * 
     * @param object resource representing map
     */
    function addMapLayer(resource, viewerId) {

      // console.log(resource)

      if (isAdded(resource, viewerId) === false) {

        prepareViewer(resource,viewerId).then(function(){
          // parse the viewer id and make sure that
          // the overlays property is initialized
          viewerId = parseMapViewerId(viewerId);
          if (angular.isUndefined(serviceData[viewerId].overlays)) {
            serviceData[viewerId].overlays = {};
          }

          // build a new overlay
          var newLayer = buildMapOverlay(resource);
          // set the viewerId in as a property (in some loop it can be useful)
          newLayer.viewerId = viewerId;
          var overlayId = parseMapOverlayId(viewerId, resource);

          // add the new layer as a property of the layer
          serviceData[viewerId].overlays[overlayId] = newLayer;
          
          // fit the bounds of the new loaded map layer, so it is visible
          fitMapBounds(resource, viewerId);
          listenAndApplyDraw();

          // broadcast the events
          $rootScope.$broadcast('mapLayersChanged');
          $rootScope.$broadcast('addedMapLayer', resource);
          showMap(resource, viewerId);
        });    
      }     
    }

    /**
     * Prepare sa viewer for loading map layer according its georeferencing status
     * 
     * @param {any} resource 
     * @param {any} viewerId 
     * @returns promise 
     */
    function prepareViewer(resource, viewerId){
      if (resource.georeferenced === false) {
        return prepareForUngeoreferenced(viewerId)
      } else {
        return prepareForGeoreferenced(viewerId)
      } 
    }

    /**
     * Prepare the viewer to load an ungeoreferenced layer, removing all the base layers and overlays
     * @param {} viewerId 
     * @returns promise
     */
    function prepareForUngeoreferenced(viewerId) {
      var deferred = $q.defer();
      $rootScope.$broadcast('ungeoreferencedLayerToBeLoaded', viewerId);

      // to give the opportunity to the ungeoreferencedLayerToBeLoaded event listeners
      // to do some action before the viewer is prepared, it is necessary to wait a little
      // so we use the timeout for that. 200 milliseconds appears to be enough
      $timeout(function(){
        serviceData[viewerId].overlays = {};
        serviceData[viewerId].baselayers = {};
        deferred.resolve();               
      }, 200);

      // return the promise
      return deferred.promise;      
    }

    /**
     * Prepare the viewer to load an ungeoreferenced layer, removing all the base layers and overlays
     * @param {} viewerId 
     * @returns promise
     */
    function prepareForGeoreferenced(viewerId) {
      var deferred = $q.defer();
      $rootScope.$broadcast('georeferencedLayerToBeLoaded', viewerId);      
      
      // to give the opportunity to the ungeoreferencedLayerToBeLoaded event listeners
      // to do some action before the viewer is prepared, it is necessary to wait a little
      // so we use the timeout for that. 200 milliseconds appears to be enough
      $timeout(function(){
        serviceData[viewerId].baselayers = getBaseLayers();
        deferred.resolve();               
      }, 200);

      // return the promise
      return deferred.promise;
    }

    /**
     * Remove a map resource from the overlays
     * @param {} resource map
     * @param string viewerId 
     */
    function removeMapLayer(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      var overlayId = parseMapOverlayId(viewerId, resource);
      delete serviceData[viewerId].overlays[overlayId];
      listenAndApplyDraw();
      $rootScope.$broadcast('mapLayersChanged');
      $rootScope.$broadcast('removedMapLayer', resource);
    }

    /**
     * Remove a map resource from the overlays
     * @param {} resource map
     * @param string viewerId 
     */
    function removeAllMapLayers(viewerId) {
      viewerId = parseMapViewerId(viewerId);
      serviceData[viewerId].overlays = {};
      $rootScope.$broadcast('mapLayersChanged');
      $rootScope.$broadcast('removedAllMapLayers');
    }

    /**
     * Hide a map but keep it in the loaded list
     * @param {} resource map
     * @param string viewerId 
     */
    function hideMap(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      var overlayId = parseMapOverlayId(viewerId, resource);
      serviceData[viewerId].overlays[overlayId].visible = false;
      $rootScope.$broadcast('mapLayersChanged');
      $rootScope.$broadcast('mapHidden', resource);
    }

    /**
     * Show a map previously loaded
     * @param {} resource map
     * @param string viewerId 
     */
    function showMap(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      var overlayId = parseMapOverlayId(viewerId, resource);
      serviceData[viewerId].overlays[overlayId].visible = true;
      $rootScope.$broadcast('mapLayersChanged');
      $rootScope.$broadcast('mapShown', resource);
    }

    /**
     * Hide a viewer
     * @param string viewerId 
     */
    function hideViewer(viewerId) {
      viewerId = parseMapViewerId(viewerId);
      serviceData[viewerId].visible = false;
      $rootScope.$broadcast('mapViewersChanged');
      $rootScope.$broadcast('viewerHidden', viewerId);
    }

    /**
     * Show a viewer     
     * @param string viewerId 
     */
    function showViewer(viewerId) {
      viewerId = parseMapViewerId(viewerId);
      serviceData[viewerId].visible = true;
      $rootScope.$broadcast('mapViewersChanged');
      $rootScope.$broadcast('viewerShown', viewerId);
    }

    /**
     * Parse a default layer id
     * @param string viewerId 
     */
    function parseMapViewerId(viewerId) {
      if (angular.isUndefined(viewerId) || viewerId === null) {
        viewerId = 'rightMapViewer';
      }
      return viewerId;
    }

    /**
     * Parse a default layer id
     * @param string viewerId 
     * @param {} resource map 
     */
    function parseMapOverlayId(viewerId, resource) {
      if (angular.isUndefined(viewerId) || viewerId === null) {
        viewerId = 'rightMapViewer';
      }
      var overlayId = viewerId + resource.id;
      return overlayId;
    }

    /**
     * check if a map resource is already loaded
     * 
     * @param object resource 
     */
    function isAdded(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      if (angular.isUndefined(serviceData[viewerId].overlays)) {
        return false;
      }
      var overlayId = parseMapOverlayId(viewerId, resource);
      return angular.isDefined(serviceData[viewerId].overlays[overlayId]);
      //return (resource.id in serviceData[viewerId].overlays);
    }

    /**
     * Check if  there are non georeferenced layers loaded in the viewer
     * 
     * @param string viewerId 
     * @returns boolean
     */
    function hasNonGeoreferencedLayer(viewerId) {
      viewerId = parseMapViewerId(viewerId);
      var nonGeoLayers = lodash.filter(getViewerOverlays(viewerId), function (layer) {
        return layer.resource.georeferenced === false;
      });
      return angular.isArray(nonGeoLayers) && nonGeoLayers.length > 0;
    }

    /**
     * Refresh the resource of a layer
     * @param {resource} resource 
     * @param string viewerId 
     */
    function refreshLayerResource(resource, viewerId) {
      viewerId = parseMapViewerId(viewerId);
      var overlayId = parseMapOverlayId(viewerId, resource);
      delete serviceData[viewerId].overlays[overlayId];
      addMapLayer(resource, viewerId);
    }

    /**
     * When a map is edited, refresh the map the map layer
     */
    function refreshMapResource(resource) {
      if (isAdded(resource, 'rightMapViewer')) {
        refreshLayerResource(resource, 'rightMapViewer');
      }
      if (isAdded(resource, 'leftMapViewer')) {
        refreshLayerResource(resource, 'leftMapViewer');
      }
    }

    /**
     * Apply the new order and broadcast the mapLayersReordered event
     * 
     * @param {any} layersInOrder 
     */
    function applyReorder(layersInOrder) {
      var counter = 1;
      // iterate over the layersInOrder and apply the new z-index of each one
      layersInOrder.slice().reverse().forEach(function (value) {
        // for each layer identification, we get the leaflet layers object
        leafletData.getLayers(value.viewerId).then(function (layers) {
          // we parse the mapOverlayId
          var overlayId = parseMapOverlayId(this.value.viewerId, this.value.resource);
          // apply the new z-index
          layers.overlays[overlayId].setZIndex(this.counter);
        }.bind({value: value,counter: counter}));
        counter++;
      });

      // broadcast the event
      $rootScope.$broadcast('mapLayersReordered');
    }

    function addWFSLayer(layerName, viewerId) {
      console.log(">>> MaplayerService >>> addWFSLayer >>> ", layerName);
      leafletData.getMap(viewerId).then(function (map) {
      var tempLayer = new leaflet.WFS({
        url: 'https://demo.geo-solutions.it:443/geoserver/ows',
        typeNS: 'topp',
        typeName: 'tasmania_state_boundaries',
        /* url: 'http://0.0.0.0:8081/geoserver/ows',
        typeNS: 'public',
        typeName: '0_1536149875', // layerName */
        crs: leaflet.CRS.EPSG4326,
        geometryField: 'the_geom',
        style: {
            color: 'blue',
            weight: 2
        }
      }).addTo(map)
        .on('load', function () {
          map.fitBounds(tempLayer.getLayers()[0].getBounds());
        })
      });
    }

    return service;
  }
})();