(function () {

  'use strict';

  angular
    .module('app')
    .controller('MapViewerController', MapViewerController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function MapViewerController(vm, $scope, options, $controller, MapService, lodash, Global, C2Dialog, MapTypeService, leafletData, leaflet, $mdSidenav, SupportService, $rootScope, MapLayerService, $timeout, $window, $state, $translate, $mdColors, C2Toast) {

    // Functions Block    
    vm.afterSearch = afterSearch;
    vm.onActivate = onActivate;
    vm.applyFilters = applyFilters;
    vm.toggleLeft = toggleLeft;
    vm.toggleRight = toggleRight;
    vm.switchToView = switchToView;
    vm.reset = reset;
    vm.toggleViewersCenterLink = toggleViewersCenterLink;
    vm.hideViewer = hideViewer;
    vm.showBothViewers = showBothViewers;
    vm.toggleWheelZoom = toggleWheelZoom;
    vm.toggleAddGCP = toggleAddGCP;

    // Set options as context variables
    vm.supportListingView = options.supportListingView;
    vm.supportDrawing = options.supportDrawing;
    vm.titleTranslKey = options.titleTranslKey;
    vm.showGeoRefTools = options.showGeoRefTools;
    vm.leftSideBar = options.leftSideBar;
    // vm.rightSideBar = options.rightSideBar;
    vm.showGcpTable = options.showGcpTable;
    vm.gcpTable = options.gcpTable;
    vm.displayBottomNav = false;

    if(angular.isUndefined(options.rightSideBar)) {
      vm.rightSideBar = Global.clientPath + "/shared/map-viewer/navs/map-right-sidenav.html";
    } else {
      vm.rightSideBar = options.rightSideBar;
    }

    if(angular.isUndefined(options.bottomNav)) {
      vm.displayBottomNav = true;
    } else {
      vm.displayBottomNav = false;
    }

    // instantiate base controller
    $controller('CRUDController', {
      vm: vm,
      modelService: MapService,
      options: {
        searchOnInit: true,
        perPage: 7
      }
    });

    /**
     * Execute the action when this controller is activated
     * 
     */
    function onActivate() {
      // call child onActivate function, if it exists
      if (angular.isFunction(vm.beforeViewerActivate)) {
        vm.beforeViewerActivate();
      }

      // Initially the bottom nav start retracted
      vm.showBottomNav = false;

      // Get the map types from the service
      MapTypeService.paginate().then(
        function (response) {
          vm.mapTypes = response.items;
        }
      );

      // Build the options for the default layers building task      
      var options = {
        supportDrawing: vm.supportDrawing
      };

      // Build the base layers for both viewers (leftMapViewer and rightMapViewer)    
      MapLayerService.buildDefaultLayers(options);

      // check if at the beginning, both viewers 
      // should have draw capabilities and (if yes) add
      if (vm.supportDrawing === true) {
        vm.rightControls = {
          draw: {}
        };
        vm.leftControls = {
          draw: {}
        }
      }

      // Initial center in Heidelberg, Germany
      vm.leftCenter = MapLayerService.getDefaultCenter();

      // Get each viewer data
      vm.leftMapViewer = MapLayerService.getViewerData('leftMapViewer');
      vm.rightMapViewer = MapLayerService.getViewerData('rightMapViewer');

      // At the beginning, both viewers are visible     
      vm.showRightMapViewer = true;
      vm.showLeftMapViewer = true;

      // Initially, both maps should have the same center, moving together      
      vm.rightCenter = vm.leftCenter;

      // Refresh the viewers, so the tiles are loaded/adjusted
      // according the view size
      refreshMapViewer();

      // Initially the mouse wheel scroll as a zoom control starts disabled
      // so the user can scroll the page easily
      vm.rightWheelZoomEnabled = false;
      vm.leftWheelZoomEnabled = false;
      MapLayerService.setWheelZoomStatus('leftMapViewer', false);
      MapLayerService.setWheelZoomStatus('rightMapViewer', false);

      // call child onActivate function, if it exists
      if (angular.isFunction(vm.onViewerActivate)) {
        vm.onViewerActivate();
      }
    }


    /**
     * Switched the view and broadcast and event when the view is switched
     */
    function switchToView(view) {
      vm.goTo(view);
      $rootScope.$broadcast('switchedView', view);
      if (view === 'form') {
        // Refresh the viewers, so the tiles are loaded/adjusted
        // according the view size
        refreshMapViewer();
      }
    }
  
    /**
     * Diasble Add GCP Points button. The first time that the viewers load, the buttons should be disabled are there is no overlays other than baselayers.
     */
    function toggleAddGCP(){
      return MapLayerService.getOverlaysCountBool();
    }

    /**
     * Toggle the mouse wheel scroll as a zoom control for a viewer
     * 
     * @param {any} viewerId 
     */
    function toggleWheelZoom(viewerId) {
      if (viewerId === 'rightMapViewer') {
        vm.rightWheelZoomEnabled = !vm.rightWheelZoomEnabled;
        MapLayerService.setWheelZoomStatus(viewerId, vm.rightWheelZoomEnabled);
      } else {
        vm.leftWheelZoomEnabled = !vm.leftWheelZoomEnabled;
        MapLayerService.setWheelZoomStatus(viewerId, vm.leftWheelZoomEnabled);
      }
    }

    /**
     * Refresh the map on the viewer. 
     * Useful when the viewer is resized or switched from one/two viewers
     * 
     * @return void 
     */
    function refreshMapViewer() {
      // This is a hack to force leaflet redraw/resize correctly the maps
      // in the case when there are two map viewers and the container of one of them 
      // is resized. 
      // The candidates map.invalidateSize() and map.eachLayer(function(layer){layer.redraw();});
      // have not worked at all on this case
      // @see  https://github.com/Leaflet/Leaflet/issues/694
      $timeout(function () {
        // We manually fire the browser resize event inside a
        // timeout function with a delay of 1 tenth of second
        // For some reason, when this event occurs, leaflet
        // is able to resize/redraw the tiles correctly
        $window.dispatchEvent(new Event('resize'));
      }, 100);
    }

    /**
     * Hide a viewer
     * 
     * @param {any} viewerId 
     */
    function hideViewer(viewerId) {
      if (viewerId === 'leftMapViewer') {
        vm.showLeftMapViewer = false;
      } else {
        vm.showRightMapViewer = false;
      }
      // Tells the service that a viewer is now hidden
      // Internally the service propagate this so other controllers/services
      // can listen to this event and apply changes
      MapLayerService.hideViewer(viewerId);

      // As there is only one viewer, it must have used the full space
      vm.viewerWidth = 100;

      // This attribute is used to determine if the viewer split button must be shown
      vm.bothViewersVisible = false;

      // Refresh the viewers, so the tiles are loaded/adjusted
      // according to the view size
      refreshMapViewer();
    }

    /**
     * Show both the viewers, resize both to 50%
     * and refresh the viewers (reload the tiles)
     * 
     */
    function showBothViewers() {
      // As there are two viewers, each one must have half space
      vm.viewerWidth = 50;

      // if the right viewer is hidden, show it
      if (vm.showRightMapViewer === false) {
        vm.showRightMapViewer = true;

        // Tells the the service that a viewer is now shown
        // Internally the service propagate this so other controllers/services
        // can listen to this event and apply changes
        MapLayerService.showViewer('rightMapViewer');
      }

      // if the left viewer is hidden, show it
      if (vm.showLeftMapViewer === false) {
        vm.showLeftMapViewer = true;

        // Tells the the service that a viewer is now shown
        // Internally the service propagate this and other controllers/services
        // can listen to this event and apply changes
        MapLayerService.showViewer('leftMapViewer');
      }
      // This attribute is used to determine if the viewer split button must be shown
      vm.bothViewersVisible = true;

      // After the changes we refresh the viewers, to the tiles are adjusted
      refreshMapViewer();
    }

    /**
     * Link or unlink the center of both viewers
     * 
     * @param {string} masterViewer - the viewer from which the center will be used to centralized itself
     */
    function toggleViewersCenterLink(masterViewer) {
      // console.log(">>> map-viewer.controller >>> toggleViewersCenterLink >>> ", masterViewer);
      // if loaded ungeoreferenced file then can't link the maps
      // if the viewers' center are linked, unlink then
      // but keep them with the same center
      if (vm.rightCenter == vm.leftCenter) {
        vm.rightCenter = angular.copy(vm.leftCenter);

      }
      // if the viewers' center are not linked, link
      // them, moving the slave viewer's center to the center of
      // the 'master viewer' center passed as parameter
      else {
        if(! MapLayerService.hasNonGeoreferencedLayer('leftMapViewer')) {
          if (masterViewer === 'leftMapViewer') {
            vm.rightCenter = vm.leftCenter;
          } else {
            vm.leftCenter = vm.rightCenter;
          }
        }
        else {
          // console.log("can't load right map since right side is ungeorefernced")
          C2Toast.info($translate.instant('dialog.cantLoadDescription'));
        } 
      }
    }

    /**
     * Listen to the event that tells us that an ungeoreferenced map will be loaded
     * and unlink the viewers' center. This event occurs before the map is loaded
     * and receive the viewer id where the ungeoreferenced mao will be loaded
     */
    $rootScope.$on('ungeoreferencedLayerToBeLoaded', function (event, viewerId) {
      // the toggle function unlink on viewer's center       
      if (vm.rightCenter == vm.leftCenter) {
        toggleViewersCenterLink(viewerId);
      }
    });

    /**
     * Listen to the event that tells us that an georeferenced map will be loaded
     * and link the viewers' center. This event occurs before the map is loaded
     * and receive the viewer id where the georeferenced mao will be loaded
     */
    $rootScope.$on('georeferencedLayerToBeLoaded', function (event, viewerId) {
      // the toggle function unlink on viewer's center       
      if (vm.rightCenter != vm.leftCenter) {
        toggleViewersCenterLink(viewerId);
      }
    });



    /**
     * Make some adjustments in the resources list after loading them
     * 
     * @param {any} response 
     */
    function afterSearch(response) {
      lodash.map(vm.resources, function (map) {
        map.mapImageFile = map.map_image_file;
        map.mapTypeName = map.map_type_name;
        map.mapGeoFile = map.field_map_geofile;
        return map;
      });
    }

    /**
     * Here we listen to the applyFilters callback to add custom filters
     * 
     * @param {any} defaultQueryFilters 
     * @returns {}
     */
    function applyFilters(defaultQueryFilters) {
      var filters = {};
      if (angular.isDefined(vm.queryFilters)) {
        if (angular.isDefined(vm.queryFilters.mapType)) {
          filters.field_map_type = angular.copy(vm.queryFilters.mapType.id);
        }
        filters.title = vm.queryFilters.title;
        if (vm.queryFilters.georeferenced !== 'All') {
          filters.georeferenced = vm.queryFilters.georeferenced;
        }
        if (vm.queryFilters.verified !== 'All') {
          filters.verified = vm.queryFilters.verified;
        }
      }

      return angular.extend(defaultQueryFilters, filters);
    }

    /**
     * Reset the search state and reload items
     */
    function reset() {
      vm.queryFilters = {};
      vm.search();
    }

    /**
     * Open/close the left side nav
     * 
     */
    function toggleLeft() {
      $mdSidenav('left').toggle();
    }

    /**
     * Open/close the right side nav
     * 
     */
    function toggleRight() {
      $mdSidenav('right').toggle();
    }

    /**
     * 
     * 
     */
    function deleteGCP(gcpId) {
      console.log(">>> ma-viewer.controller >>> deleteGCP ",gcpId);
    }
  }

})();