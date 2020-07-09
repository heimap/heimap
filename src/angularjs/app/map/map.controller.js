(function () {

  'use strict';

  angular
    .module('app')
    .controller('MapController', MapController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function MapController($controller, C2Dialog, $scope, Global, MapViewerService, $rootScope, $window) {
    var vm = this;

    // Functions Block
    vm.openAddMap = openAddMap;
    vm.openEditMap = openEditMap;
    vm.onViewerActivate = onViewerActivate;

    // Set the map viewer options
    var options = {
      supportListingView : true,
      supportDrawing : false,
      titleTranslKey : 'views.titles.mapView',
      leftSideBar: Global.clientPath + '/map/navs/map-left-sidenav.html'
    }     

    // instantiate the base MapViewerController
    $controller('MapViewerController', {vm: vm, $scope: $scope, options});

    /**
     * Actions executed after the base viewer is activated
     * 
     */
    function onViewerActivate(){ 
      // Set global viewer options
      MapViewerService.setOption('rightMapViewer', 'showLoadMapInRight', true);
      MapViewerService.setOption('leftMapViewer', 'showLoadMapInRight', true);
    }    
    
    /**
     * Listen to the added map draw  event and save the map
     * in the back-end
     */
    $rootScope.$on('addedMapDraw', function (event, drawsGeoJson) {
      console.log(">>>map.controller >>> addedMapDraw ",drawsGeoJson);
      vm.resource.draws = drawsGeoJson;
      openAttributeDailog(drawsGeoJson);
      // it is needed to define a way to identify the target map over which the polygon was drawn, so it can be saved as a vector data to that map
      //vm.resource.$save();
    });


    /**
     * Open the dialog to add a map
     * @return void
     */
    function openAddMap() {
      openDialog();
    }

    /**
     * Open the dialog to edit a map
     * 
     * @param {any} resource 
     *  @return void
     */
    function openEditMap(resource) {
      openDialog(resource);
    }

    /**
     * Open the dialog that allows add or edit a map
     * When closed, the resources (maps) will be refreshed
     * 
     * @param {any} resource 
     * @return void
     */
    function openDialog(resource) {
      // var config = {
      //   locals: {
      //     mapDialogInput: {
      //       model: resource,
      //       removeFn: vm.remove
      //     }
      //   },
      //   controller: 'MapDialogController',
      //   controllerAs: 'ctrl',
      //   templateUrl: Global.clientPath + '/map/dialog/map-dialog.html',
      //   hasBackdrop: true
      // };

      // C2Dialog.custom(config).then(function () {
      //   // reload the items from back-end
      //   vm.search();
      // });

      // New approach is to redirect it to URZ dashboard to upload map
      // http://129.206.5.209:8080/group/{{project id}}/content/create/group_node%3Amap

      $window.location = Global.dashboardUrl 
        + '/group/' 
        + sessionStorage.getItem("projId") 
        + '/content/create/group_node%3Amap';
    }

  }

})();