(function () {

  'use strict';

  angular
    .module('app')
    .controller('MapBottomNavController', MapBottomNavController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function MapBottomNavController($controller, MapService, lodash, $mdSidenav, $rootScope, MapLayerService, C2Dialog, $translate, MapViewerService, $state) {

    var vm = this;   
    vm.afterSearch = afterSearch;
    vm.toggleBottom = toggleBottom;
    vm.applyFilters = applyFilters;
    vm.toggleIncludeToWorkingList = toggleIncludeToWorkingList;
    vm.isLoaded = isLoaded;
    vm.onActivate = onActivate;
    vm.showLoadMapInLeftButton = showLoadMapInLeftButton;
    vm.showLoadMapInRightButton = showLoadMapInRightButton;
    vm.loadGcpOnMap = loadGcpOnMap;
    vm.isNonGeorefLoaded = isNonGeorefLoaded;
    vm.showFilterCheckbox = false;
    vm.showOnlyChildMap = false;
    vm.showOnlyChildMapFunc = showOnlyChildMapFunc;
    vm.isChildMap = isChildMap;

    /**
     * Execute the action when this controller is activated
     * 
     */
    function onActivate() {
      vm.showBottomNav = false;
      vm.showLoadMapInRight = MapViewerService.getOption('rightMapViewer', 'showLoadMapInRight', true);
      vm.showLoadMapInLeft = MapViewerService.getOption('leftMapViewer', 'showLoadMapInLeft', true);
      
    }

    // instantiate base controller
    $controller('CRUDController', {
      vm: vm,
      modelService: MapService,
      options: {
        searchOnInit: false,
        perPage: 11
      }
    });
    
    /**
     * Listen to the view switch event and reload the data
     * from the back-end if the target view is the the form
     */
    $rootScope.$on('switchedView', function (event, data) {
      if (data === 'form') {
        vm.search(vm.paginator.currentPage);
      }      
    });

    $rootScope.$on('viewerShown', function (event, viewerId) {
        if(viewerId === 'rightMapViewer') {
          vm.showLoadMapInRight = true;
        } else {
          vm.showLoadMapInLeft = true;
        }
    });     

    $rootScope.$on('viewerHidden', function (event, viewerId) {
      if(viewerId === 'rightMapViewer') {
        vm.showLoadMapInRight = false;
      } else {
        vm.showLoadMapInLeft = false;
      }   
    });

    // $scope.$on('showOnlyChildMap', function(newVal, oldVal) {
    //   console.log(">>> showOnlyChildMap >>> ", newVal, oldVal)
    //   // vm.search(vm.paginator.currentPage);
    // })
    /**
     * Here we listen to the applyFilters callback to add custom filters
     * 
     * @param {any} defaultQueryFilters 
     * @returns {}
     */
    function applyFilters(defaultQueryFilters) {     
      if(angular.isUndefined(vm.queryFilters))  {
        vm.queryFilters = {};
      }      
      return angular.extend(defaultQueryFilters, vm.queryFilters);
    }    

    /**
     * Make some adjustments in the resources list after loading them
     * 
     * @param {any} response 
     */
    function afterSearch(response) {
      lodash.map(vm.resources, function (map) {
        map.mapImageFile = map.map_image_file;
        map.mapTypeName = map.map_type_name;       
        return map;
      });
    }

     /**
     * Open/close the right side nav
     * 
     */
    function toggleBottom(){  
      vm.showBottomNav = !vm.showBottomNav; 
      if(vm.showBottomNav === true) {
        vm.paginator.currentPage = (vm.paginator.currentPage > 0) ? vm.paginator.currentPage : 1;
        vm.search(vm.paginator.currentPage);
      }           
    } 
    
    /**
     * Add/remove a map to the working list
     * 
     * @param object resource 
     */
    function toggleIncludeToWorkingList(resource, viewerId){
      var toggleLoadMap = function(){
        if (isLoaded(resource, viewerId)){
          MapLayerService.removeMapLayer(resource, viewerId);
        } else {
          MapLayerService.addMapLayer(resource, viewerId);
        }
      }  
      // Confirm before loading non georeferenced map    
      if(!isLoaded(resource, viewerId) && resource.georeferenced === false) {
        var config = {
          title: $translate.instant('dialog.confirmLoadUngeoreferencedTitle'),
          description: $translate.instant('dialog.LoadUngeoreferencedDescription'),
          yes: $translate.instant('global.yes'),
          no: $translate.instant('global.no')
        }
        C2Dialog.confirm(config).then(function () {  
          toggleLoadMap();
          // look for Georef maps which are associated to currenctly nongeoref image
          checkAllGeoRefMaps(resource);
        });
      } 
      // Confirm before loading georeferenced map when a non georeferenced map is already loaded   
      else if (MapLayerService.hasNonGeoreferencedLayer(viewerId)) {
        var config = {
          title: $translate.instant('dialog.confirmLoadGeoreferencedTitle'),
          description: $translate.instant('dialog.LoadGeoreferencedDescription'),
          yes: $translate.instant('global.yes'),
          no: $translate.instant('global.no')
        }
        C2Dialog.confirm(config).then(function () { 
          MapLayerService.removeAllMapLayers(viewerId);
          toggleLoadMap();
        });
      } else { // in the other cases, run directly the toggleLoadMap to remove?/add a map
        toggleLoadMap();
      }     
    }

    /**
     * check if a map resource is already loaded
     * 
     * @param object resource 
     */
    function isLoaded(resource, viewerId){
      var isLoaded = MapLayerService.isAdded(resource, viewerId);
      return isLoaded;
    }

    /**
     * check if current page is Georeference and if the map resource is nongeoreferenced 
     * than only allow the user to load it in left map and georeferenced resource in right map
     * 
     * @param object resource 
     * @returns boolean
     */
    function showLoadMapInLeftButton(resource) {
      if($state.current.name === "app.georeference") {
        if( resource.georeferenced===false) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    /**
     * check if current page is Georeference and if the map resource is nongeoreferenced 
     * than only allow the user to load it in left map and georeferenced resource in right map
     * 
     * @param object resource 
     * @returns boolean
     */
    function showLoadMapInRightButton(resource) {
      if($state.current.name === "app.georeference") {
        if( resource.georeferenced===true) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    /**
     * Called when "Load GCP on Map button is clicked"
     * Triggers a event to Georeference controller to handle
     * 
     * @param object resource
     */
    function loadGcpOnMap(resource) {
      // console.log(">>> map.bottom.nav.controller >>> loadGcpOnMap");
      if(resource.georeferenced) {
        if(resource.gcps) {
          // broadcast to Georeference controller to create markers
          $rootScope.$broadcast("createGcpOnMap", JSON.parse(resource.gcps));
        }
      }
    }

    /**
     * checks if NonGeoreferenced image is loaded in left map
     * 
     * @param object resource 
     * @returns boolean 
     */
    function isNonGeorefLoaded(resource, mapViewer) {
      if(resource.canLoadGcp) {
        return true;
      }
    }

    /**
     * Once a NonGeoreferenced image is loaded, check for all Georeferenced maps to know 
     * which are associated to it. Once we have the list of georef maps, activate their Load GCP button
     * 
     * @param object resource
     */
    function checkAllGeoRefMaps(resource) {
      var fileName = resource.map_image_file.name;
      if(fileName.split('.') !== -1) {
        // let the checkbox be visible for the user to filter
        vm.showFilterCheckbox = true;
        fileName = fileName.split('.').slice(0, -1).join('.');
        // loop through all the resources
        lodash.forEach(vm.resources, function(eachResource) {
          if(eachResource.georeferenced) {
            var tempImageName = eachResource.map_image_file.name;
            tempImageName = tempImageName.split('_rect').slice(0, -1).join('_rect');
            if(tempImageName === fileName) {
              // console.log("eachResources = ", eachResource);
              eachResource.canLoadGcp = true;
              eachResource.isChildOfLoadedNongeoref = true;
            } else {
              eachResource.canLoadGcp = false;
              eachResource.isChildOfLoadedNongeoref = false;
            }
          }
          else {
            eachResource.isChildOfLoadedNongeoref = false;
          }
        });
      } else {
        console.log("file doesnt have extension");
      }
    }

    function isChildMap(resource) {
      if(angular.isDefined(vm.showOnlyChildMap)) {
        if(vm.showOnlyChildMap) {
          if(resource.isChildOfLoadedNongeoref) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
    
    function showOnlyChildMapFunc() {
      if(vm.showOnlyChildMap) {
        // get currently loaded resource
        var resource = MapLayerService.getViewerOverlays('leftMapViewer');
        // console.log("resource = ", resource);
        // console.log(Object.values(resource)[0].resource.map_source_id);
        var tempMapId = Object.values(resource)[0].resource.map_source_id;
        // create a filter
        vm.queryFilters = { "parent_id" : tempMapId };
        // call applyFilter, which will take care of rest
        vm.search(vm.paginator.currentPage);
        afterSearch("response");
      } else {
        vm.queryFilters = null;
        vm.search(vm.paginator.currentPage);
        afterSearch("response");
      }
    }

  }

})();