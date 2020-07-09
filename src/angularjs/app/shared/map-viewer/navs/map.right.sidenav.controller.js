(function () {

  'use strict';

  angular
    .module('app')
    .controller('MapRightSidenavController', MapRightSidenavController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function MapRightSidenavController($scope, $timeout, $mdSidenav, $log, $rootScope, MapLayerService, lodash, $window) {

    var vm = this;
    vm.close = close;
    vm.showMap = showMap;
    vm.hideMap = hideMap;
    vm.removeMap = removeMap;
    vm.applyOpacity = applyOpacity;
    vm.fitMapBounds = fitMapBounds;
    vm.filterMapLayers = filterMapLayers;

    /**
     * Run the initial actions when the controller is activated
     */
    function activate() {
      refreshOverlays();
      vm.sortableConf = {onUpdate: updateAfterSort, handle: '.grab-handle'};
    }

   
    

    /**
     * Close the sidenav
     */
    function close() {     
      $mdSidenav('right').close()
        .then(function () {
          // you can add some task after closing
        });
    }; 
    
    /**
     * Show a map already loaded in the viewer
     * @param {} layer 
     */
    function showMap(layer) {
      MapLayerService.showMap(layer.resource, layer.viewerId);
    }

    /**
     * Hide a map already loaded in the viewer
     * @param {} layer 
     */
    function hideMap(layer) {
      MapLayerService.hideMap(layer.resource, layer.viewerId);
    } 
    
    /**
     * Remove (unload) a map from the viewer
     * @param {} layer 
     */
    function removeMap(layer) {
      MapLayerService.removeMapLayer(layer.resource, layer.viewerId);
    }

    /**
     * Fit the bounds of an already loaded map so the that all the map is visible
     * @param {} layer 
     */
    function fitMapBounds(layer) {
      MapLayerService.fitMapBounds(layer.resource, layer.viewerId);
    }

    /**
     * Apply the opacity defined in the layer.layerParams.opacity property
     * @param {} layer 
     */
    function applyOpacity(layer) {
      MapLayerService.applyOpacity(layer);
    }

    /**
     * Filter the map layers loaded in the viewer by name
     */
    function filterMapLayers(){
      refreshOverlays();
      vm.loadedMapsLayers = lodash.filter(vm.loadedMapsLayers, function(layer){
        return layer.resource.title.toLowerCase().indexOf(vm.filterMapLayersTxt.toLowerCase()) != -1;       
      });
    }

    /**
     * Refresh the maps layers in the sidebar list when the mapLayersChanged event is broadcasted
     */
    $rootScope.$on('mapLayersChanged', function (event) {  
      refreshOverlays();      
    }); 
    
    /**
     * Refresh the overlays in the property loadedMapsLayers getting it from MapLayerService
     * 
     */
    function refreshOverlays(){
      // initially define the overlays as an empty array
      vm.loadedMapsLayers = [];
        
      // As we want to list all the layers, then get the layers from both viewers
      var rightLayers = MapLayerService.getViewerOverlays('rightMapViewer');
      if(angular.isDefined(rightLayers)){
        angular.forEach(rightLayers, function(value, key) {
          value.id = key;
          vm.loadedMapsLayers.push(value);
        });       
      }
      
      var leftLayers = MapLayerService.getViewerOverlays('leftMapViewer');
      if(angular.isDefined(leftLayers)){
        angular.forEach(leftLayers, function(value, key) {
          value.id = key;
          vm.loadedMapsLayers.push(value);
        });
      } 
      // The layers must be show in reverse order (last added on the top)
      vm.loadedMapsLayers = vm.loadedMapsLayers.slice().reverse();
    }

    /**
     * Handle the reorder/sort event and apply it to the MapLayerService
     * 
     * @param {any} evt 
     */
    function updateAfterSort(evt){      
      MapLayerService.applyReorder(evt.models);      
    }

    activate();
  }

})();