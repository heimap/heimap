(function () {
  
    'use strict';
  
    angular
      .module('app')
      .controller('VectorController', VectorController);
  
    /** @ngInject */
    // eslint-disable-next-line max-params
    function VectorController($controller, $scope, VectorService, Global) {
      var vm = this;
  
      // Functions Block     
      vm.onViewerActivate = onViewerActivate;
      vm.beforeViewerActivate = beforeViewerActivate;

      // Set the map viewer options
      var options = {
        supportListingView : false,
        supportDrawing : false,
        titleTranslKey : 'views.titles.vectorTitle',
        showVectorLayers : true,
        leftSideBar : Global.clientPath + '/vector/navs/vector-left-sidenav.html',
        rightSideBar : Global.clientPath + '/vector/navs/vector-right-sidenav.html'
        // bottomNav : false
      };

      // initialize empty markers object
      vm.rightMarkers = {};
      vm.leftMarkers = {};
      vm.layerNames = [];
  
      // instantiate the base MapViewerController
      $controller('MapViewerController', { vm: vm, $scope: $scope, options});

      /**
       * Actions executed before the base viewer is activated
       * 
       */
      function beforeViewerActivate(){  
        // get vector layers from API and list them in left side nav
        // getLayerNames();
        // get ProjId
        // console.log($scope.$parent);
      }

      /**
       * Actions executed after the base viewer is activated
       * 
       */
      function onViewerActivate(){ 
        // Set global viewer options
        // changed for resolving #184 
        // MapViewerService.setOption('rightMapViewer', 'showLoadMapInRight', false);
        // MapViewerService.setOption('rightMapViewer', 'showLoadMapInRight', true);
        // MapViewerService.setOption('leftMapViewer', 'showLoadMapInRight', true);
      }

      /**
       * Get Layer name from API
       * 
       */
      function getLayerNames () {
        var layerService = new VectorService();
        layerService.getVectorLayers()
          .then(function(result){
            vm.layerNames = result;
            console.log("layerNames = ", vm.layerNames);
          }, function(err){
            console.log(err)
            // the code inside this block will be fired if some error occur
            // here you can show some error message or do nothing, depending on the business rule
    
            //TODO: notify the user about the error?
          });
        
      }

    }
  
  })();