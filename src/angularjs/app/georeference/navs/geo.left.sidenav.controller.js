(function () {

  'use strict';

  angular
    .module('app')
    .controller('GeoLeftSidenavController', GeoLeftSidenavController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function GeoLeftSidenavController($scope, $timeout, $mdSidenav, $log, $rootScope, lodash, $mdSelect, $window, MapLayerService, GeoreferenceService, C2Toast, $translate, Global, $mdColors, C2Dialog, $mdDialog, $state, leafletData, $localStorage) {
    var vm = this;

    vm.close = close; 
    vm.save = save;
    vm.rectifyDisable = rectifyDisable;
    vm.previewGcp = previewGcp;
    vm.generateFilenameandExtent = generateFilenameandExtent;
    vm.minx = null;
    vm.miny = null;
    vm.maxx = null;
    vm.maxy = null;
    vm.gcp = null;
    vm.manualExtent = false;
    $scope.extentSelection = '0';

    $scope.$watch("extentSelection", function(newVal, old){
      // if 2 selected means draw manaul rect
      if(newVal === 2) {
        // removeExtentRectangle(function() {
          drawRectangleForExtent();
        // });
      } else if(newVal === 1) {
        cleanUp();
        // calculate minx, miny values
        calcMinMaxValues();
      } else if(newVal === 0) {
        // remove Extent rectangle from map
        cleanUp();
      }
    });

    // emit listener when save of Georeference controller called. It passes the GCP on left panel
    $rootScope.$on('saveGeoRef', function(event, args) {
      // console.log(">>> ge.left.sidenav.controller >>> saveGeoRef ", args);
      vm.gcp = args;
      // redraw the resampling method dropdown
      getResamplingMethodsBasedOnGCP(Object.keys(vm.gcp).length);
      // redraw the rectify method dropdown
      getRectifyMethodsBasedOnGCP(Object.keys(vm.gcp).length);
    });

    /**
     * Enables / Disables Rectify options in dropdown based on number of GCPS
     * 
     */
    function rectifyDisable(id){
      // Can't access numOfGCP() fun of georeference.controller.js here.
      if (id == "2ndOrderPolyn"){
        return false; // GeoreferenceController.numOfGCP >= 6
      } else if (id == "3rdOrderPolyn"){
          return false; // GeoreferenceController.numOfGCP >= 10
      } else {
        return false // Keep the button enabled for Auto and 1st Order
      }
    }

    /**
     * First function called after the controller is ran
     * here the stuff are initialized
     * 
     */
    function activate() {
      // console.log(">>> ge.left.sidenav.controller >>> activate ");
      vm.rectifyMethods = getRectifyMethods();
      vm.rectifyMethod = lodash.find(vm.rectifyMethods, function (rm) {
        // return rm.id === 'AutoBasedOnGCP';
        return rm.id === ''; // To not allow 'AutoBasedOnGCP' to be there by default
      });
      vm.resamplingMethods = getResamplingMethods();
      vm.resamplingMethod = lodash.find(vm.resamplingMethods, function (rm) {
        // return rm.id === 'near';
        return rm.id === ''; // To not allow 'near' to be there by default.
      });
      monitorCloseSelect(); 
      $mdSidenav('left').onClose(function () {
        $mdSelect.hide();
      });     
      vm.geoRefFilename = '';
      // resolving #208
      if(! lodash.isEmpty($localStorage.getObject("georefLayer"))) {
        // remove base layer
        $timeout(function() {
          MapLayerService.removeAllMapLayers("leftMapViewer"); 
        }, 200);
        // Add layer to right map
        MapLayerService.addMapLayer($localStorage.getObject("georefLayer"), "rightMapViewer"); 
        // Add image layer to left map
        MapLayerService.addMapLayer($localStorage.getObject("nongeorefLayer"), "leftMapViewer");
        $localStorage.remove("georefLayer");
        $localStorage.remove("nongeorefLayer");
      }
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
     * Get the the rectify methods available to be used
     * 
     * @returns {array}
     */
    function getRectifyMethods() {
      return [
        {name: 'Auto (based on GCP)', id: 'AutoBasedOnGCP', disable: true},
        { name: '1st Order Polyn. (min 3 points required)',id: '1stOrderPolyn', disable: true},
        { name: '2nd Order Polyn. (min 6 points required)',id: '2ndOrderPolyn', disable: true},
        { name: '3rd Order Polyn. (min 10 points required)',id: '3rdOrderPolyn', disable: true}
      ]
    }

    /**
     * Get the the rectify methods based on number of GCP
     * 
     * @returns {array}
     */
    function getRectifyMethodsBasedOnGCP() {
      /* vm.rectifyMethods = [
        {name: 'Auto (based on GCP)', id: 'AutoBasedOnGCP', disable: false},
        { name: '1st Order Polyn. (min 3 points required)',id: '1stOrderPolyn', disable: false},
        { name: '2nd Order Polyn. (min 6 points required)',id: '2ndOrderPolyn', disable: false},
        { name: '3rd Order Polyn. (min 10 points required)',id: '3rdOrderPolyn', disable: false}
      ]; */
      if(Object.keys(vm.gcp).length >= 3 && Object.keys(vm.gcp).length < 6) {
        vm.rectifyMethods = [
          {name: 'Auto (based on GCP)', id: 'AutoBasedOnGCP', disable: false},
          { name: '1st Order Polyn. (min 3 points required)',id: '1stOrderPolyn', disable: false},
          { name: '2nd Order Polyn. (min 6 points required)',id: '2ndOrderPolyn', disable: true},
          { name: '3rd Order Polyn. (min 10 points required)',id: '3rdOrderPolyn', disable: true}
        ]
      } else if(Object.keys(vm.gcp).length >= 6 && Object.keys(vm.gcp).length < 10){
        vm.rectifyMethods = [
          {name: 'Auto (based on GCP)', id: 'AutoBasedOnGCP', disable: false},
          { name: '1st Order Polyn. (min 3 points required)',id: '1stOrderPolyn', disable: false},
          { name: '2nd Order Polyn. (min 6 points required)',id: '2ndOrderPolyn', disable: false},
          { name: '3rd Order Polyn. (min 10 points required)',id: '3rdOrderPolyn', disable: true}
        ]
      } else if(Object.keys(vm.gcp).length >= 10) {
        vm.rectifyMethods = [
          {name: 'Auto (based on GCP)', id: 'AutoBasedOnGCP', disable: false},
          { name: '1st Order Polyn. (min 3 points required)',id: '1stOrderPolyn', disable: false},
          { name: '2nd Order Polyn. (min 6 points required)',id: '2ndOrderPolyn', disable: false},
          { name: '3rd Order Polyn. (min 10 points required)',id: '3rdOrderPolyn', disable: false}
        ]
      }
      // if user have already selected an option from dropdown than reselected it
      if(typeof vm.rectifyMethod !== "undefined") {
        lodash.forEach(vm.rectifyMethods, function(method) {
          if(method.id === vm.rectifyMethod.id) {
            vm.rectifyMethod = method;
          }
        });
      }
    }

    /**
     * Get the the resampling methods available to be used
     * 
     * @returns {array}
     */
    function getResamplingMethods() {
      return [
        // id = gdalwarp parameter
        { name: 'Nearest neighbour resampling',id: 'near', disable: true},
        { name: 'Bilinear resampling',id: 'bilinear', disable: true},
        { name: 'Cubic resampling',id: 'cubic', disable: true}
      ]
    }

    /**
     * Get the the resampling methods based on the number of GCP points available
     * 
     * @returns {array}
     */
    function getResamplingMethodsBasedOnGCP() {
      if(Object.keys(vm.gcp).length < 3) {
        vm.resamplingMethods = [
          { name: 'Nearest neighbour resampling',id: 'near', disable: false},
          { name: 'Bilinear resampling',id: 'bilinear', disable: false},
          { name: 'Cubic resampling',id: 'cubic', disable: false}
        ]
      } else if(Object.keys(vm.gcp).length >= 3 && Object.keys(vm.gcp).length < 6) {
        vm.resamplingMethods = [
          { name: 'Nearest neighbour resampling',id: 'near', disable: false},
          { name: 'Bilinear resampling',id: 'bilinear', disable: true},
          { name: 'Cubic resampling',id: 'cubic', disable: true}
        ]
      } else if(Object.keys(vm.gcp).length >= 6 && Object.keys(vm.gcp).length < 10){
        vm.resamplingMethods = [
          { name: 'Nearest neighbour resampling',id: 'near', disable: false},
          { name: 'Bilinear resampling',id: 'bilinear', disable: false},
          { name: 'Cubic resampling',id: 'cubic', disable: true}
        ]
      } else if(Object.keys(vm.gcp).length >= 10) {
        vm.resamplingMethods = [
          { name: 'Nearest neighbour resampling',id: 'near', disable: false},
          { name: 'Bilinear resampling',id: 'bilinear', disable: false},
          { name: 'Cubic resampling',id: 'cubic', disable: false}
        ]
      }
      // if user have already selected an option from dropdown than reselected it
      if(typeof vm.resamplingMethod !== "undefined") {
        lodash.forEach(vm.resamplingMethods, function(method) {
          if(method.id === vm.resamplingMethod.id) {
            vm.resamplingMethod = method;
          }
        });
      }
    }

    /**
     * Gets called on resample Dropdown selection change, to get generate the 
     * 'filename' and extent 'value'
     * 
     */
    function generateFilenameandExtent() {
      // get the layer that contains the resource/map to be georeferenced
      var layer = MapLayerService.getViewerOverlays("leftMapViewer");
      
      // get the resource/map id from the loaded layer
      // as in the case of georeference module only one resource/map will
      // be loaded, we get the properties from the first resource in the layer
      var firstLayerKey = Object.keys(layer)[0];   

      // Get new georefenced file name from the user
      vm.geoRefFilename = layer[firstLayerKey].resource.title + "_g_" + vm.rectifyMethod.id + "_" + vm.resamplingMethod.id + "_" + ((new Date()).getMonth()+1) + "." + (new Date()).getDate() + "." + (new Date()).getFullYear();
      
      // calculate minx, miny values
      calcMinMaxValues();
      vm.bboxCropImage = vm.minx + " " + vm.miny + " " + vm.maxx + " " + vm.maxy;
    }
    
    /**
     * Calculates the minx, miny, maxx and maxy values based on GCP created 
     * on right map
     * 
     */
    function calcMinMaxValues() {
      // Crop final georeferenced image
      var lat = []; var lng = [];
      for (var i=0; i<Object.keys($scope.$parent.vm.rightMarkers).length; i++){
        lat.push(Object.values($scope.$parent.vm.rightMarkers)[i]["lat"]);
        lng.push(Object.values($scope.$parent.vm.rightMarkers)[i]["lng"])
      }
      // assign the extent values to scope variable to diplay on page
      vm.minx = parseFloat(Math.min.apply(Math, lng).toFixed(5));
      vm.miny = parseFloat(Math.min.apply(Math, lat).toFixed(5));
      vm.maxx = parseFloat(Math.max.apply(Math, lng).toFixed(5));
      vm.maxy = parseFloat(Math.max.apply(Math, lat).toFixed(5));
    }

    /**
     * In a combination of leaflet, ui-leaflet, sidenav and md-select
     * when the md-select drop down options are open and the user clicks
     * outside the options overlay, the md-select is not been closed automatically
     * So, for instance we had to create this hack until we find a nice solution     * 
     */
    function monitorCloseSelect() {
      var $$window = angular.element($window);
      $$window.on('click', function(event){
        if (event.target.classList[0] === 'md-sidenav-left') {
          $mdSelect.hide();
        }
      });      
    };

    /**
     * Save//apply the georeference to the layer/resource loaded in the leftMapViewer
     * 
     */
    function save(){
      // check for number of markers on both maps to be equal
      if(Object.values($scope.$parent.vm.leftMarkers).length === Object.values($scope.$parent.vm.rightMarkers).length) {
        // get the layer that contains the resource/map to be georeferenced
        var layer = MapLayerService.getViewerOverlays("leftMapViewer");

        // instantiate the georeference service that is linked with the back-end end-point
        var geoRef = new GeoreferenceService();

        // get the markers from left and right viewers from parent controller
        geoRef.imageCoordinates = $scope.$parent.vm.leftMarkers;
        geoRef.worldCoordinates = $scope.$parent.vm.rightMarkers;
        geoRef.rectifyMethod = vm.rectifyMethod.id;
        geoRef.resamplingMethod = vm.resamplingMethod.id;

        // console.log($scope.$parent.vm);
        // console.log(vm);


        // get the resource/map id from the loaded layer
        // as in the case of georeference module only one resource/map will
        // be loaded, we get the properties from the first resource in the layer

        var firstLayerKey = Object.keys(layer)[0];      
        geoRef.mapId = layer[firstLayerKey].resource.id;

        // Convert AutoBasedOnGCP to Order 
        var numCoordinates = Object.values(geoRef.imageCoordinates).length;
        (geoRef.rectifyMethod == "AutoBasedOnGCP") ? (numCoordinates >= 3 && numCoordinates < 6) ? geoRef.rectifyMethod = "1stOrderPolyn" : (numCoordinates >= 6 && numCoordinates < 10) ? geoRef.rectifyMethod = "2ndOrderPolyn" : geoRef.rectifyMethod = "3rdOrderPolyn" : null;

        // Get new georefenced file name from the user
        // geoRef.newFileName = prompt("Enter new file name. Default is follows:", layer[firstLayerKey].resource.title + "_g_" + geoRef.rectifyMethod + "_" + geoRef.resamplingMethod + "_" + ((new Date()).getMonth()+1) + "." + (new Date()).getDate() + "." + (new Date()).getFullYear());
        // use the filename generated in 
        geoRef.newFileName = vm.geoRefFilename;
        
        // Crop final georeferenced image
        /* var lat = []; var lng = [];
        for (var i=0; i<Object.keys(geoRef.worldCoordinates).length; i++){
          lat.push(Object.values(geoRef.worldCoordinates)[i]["lat"]);
          lng.push(Object.values(geoRef.worldCoordinates)[i]["lng"])
        }
        var lngmin = Math.min.apply(Math, lng);
        var latmin = Math.min.apply(Math, lat);
        var lngmax = Math.max.apply(Math, lng);
        var latmax = Math.max.apply(Math, lat); */
        // geoRef.bboxCropImage = prompt("Enter coordinates to crop the image: min Lng, min Lat, max Lng, max Lat. Default extent, as shown below, is selected based from the provided GCPs. If don't want any cropping then simply delete the default coordinates.", lngmin + " " + latmin + " " + lngmax + " " + latmax);
        if($scope.extentSelection=='0') {
          geoRef.bboxCropImage = "";
        } 
        // if extent is by values provided by the user then just send 4 params to /apply API
        else if($scope.extentSelection=='1') {
          geoRef.bboxCropImage = vm.minx +" "+ vm.miny +" "+ vm.maxx +" "+ vm.maxy;
        } 
        // if extent is by drawing a rectangle on map then send 8 params to /apply API
        else if($scope.extentSelection=='2') {
          geoRef.bboxCropImage = 
            vm.minx +" "+ vm.miny +" "+
            vm.maxx +" "+ vm.miny +" "+
            vm.maxx +" "+ vm.maxy +" "+
            vm.minx +" "+ vm.maxy;
        }
        // console.log(geoRef.bboxCropImage)

        geoRef.applyEndPoint = '/heimap/georef/apply';
        geoRef.$save()
        // geoRef.saveGeoRef()
        .then(function(result){

          // console.log(result.id)
          // console.log(angular.isDefined(result.id))
          // console.log("zz");
          
          if(angular.isDefined(result.id)){
            close();
            C2Toast.success($translate.instant('messages.saveGeoreferenceSuccess'));
          } 

          for(var i=0; i < numCoordinates; i++){
            delete $scope.$parent.vm.leftMarkers[Object.values($scope.$parent.vm.leftMarkers)[0]["id"]]
            delete $scope.$parent.vm.rightMarkers[Object.values($scope.$parent.vm.rightMarkers)[0]["id"]]
          };

          //TODO: 
          /* update the viewer state with the georeferenced resource
              reset the GCP
          */
          /* var whereToGo = prompt("Enter your next action: 1 to view recently georeferenced image and/or georeference another image and 2 to upload new image", "1");

          switch(whereToGo){
            case "1": 
              MapLayerService.removeAllMapLayers("leftMapViewer"); 
              MapLayerService.addMapLayer(result, "rightMapViewer"); 
              break;
            case "2": 
              $window.location.href = '#!/map'; 
              break;
          } */

          // // fire event to GCP controller for call refreshGCPTable
          // $rootScope.$broadcast("refreshGcpTableEvent");
          // create popup box
          var confirm = $mdDialog.confirm()
            .title('Next Action?')
            .textContent('View recently georeferenced image and/or georeference another image OR upload a new image')
            // .ariaLabel('Lucky day')
            .ok('Load it in Right Map')
            .cancel('Upload a new file');

          $mdDialog.show(confirm).then(function() {
            // console.log("Load in right map clicked");
            // MapLayerService.removeAllMapLayers("leftMapViewer"); 
            // MapLayerService.addMapLayer(result, "rightMapViewer"); 
            // resolving Dirk's request menitoned in #182
            // resolving #208 with use of localstorage
            var tempLeftLayer = layer[Object.keys(layer)[0]].resource;
            // delete it because it has reference to other Models, which creates a circular JSON
            if(typeof tempLeftLayer.$$array !== "undefined") {
              delete tempLeftLayer.$$array;  
            }
            $localStorage.setObject("nongeorefLayer", tempLeftLayer);
            $localStorage.setObject("georefLayer", result);
            $state.reload();
          }, function() {
            // console.log("upload a new file");
            // change app state to map, first page of app
            $state.go('app.map');
          });
          
        }, function(err){
          console.log(err)
          // the code inside this block will be fired if some error occur
          // here you can show some error message or do nothing, depending on the business rule

          //TODO: notify the user about the error?
        });
      } else {
        var config = {
          title: $translate.instant('dialog.invalidGeorefTitle'),
          description: $translate.instant('dialog.invalidGeorefText'),
          toolbarBgColor:$mdColors.getThemeColor('primary'),
          okBgColor:$mdColors.getThemeColor('primary'),
          ok: $translate.instant('global.ok')
        };
        C2Dialog.alert(config);
      }
    }
   
    /**
     * Show the GCP table in a preview table
     * 
     */
    function previewGcp() {
      // check for number of markers on both maps to be equal
      if(Object.values($scope.$parent.vm.leftMarkers).length === Object.values($scope.$parent.vm.rightMarkers).length) {
        if(vm.rectifyMethod && vm.resamplingMethod) {
          // get the layer that contains the resource/map to be georeferenced
          var layer = MapLayerService.getViewerOverlays("leftMapViewer");

          // instantiate the georeference service that is linked with the back-end end-point
          var geoRef = new GeoreferenceService();

          // get the markers from left and right viewers from parent controller
          geoRef.imageCoordinates = $scope.$parent.vm.leftMarkers;
          geoRef.worldCoordinates = $scope.$parent.vm.rightMarkers;
          geoRef.rectifyMethod = vm.rectifyMethod.id;
          geoRef.resamplingMethod = vm.resamplingMethod.id;

          // get the resource/map id from the loaded layer
          // as in the case of georeference module only one resource/map will
          // be loaded, we get the properties from the first resource in the layer

          var firstLayerKey = Object.keys(layer)[0];      
          geoRef.mapId = layer[firstLayerKey].resource.id;

          // Convert AutoBasedOnGCP to Order 
          var numCoordinates = Object.values(geoRef.imageCoordinates).length;
          (geoRef.rectifyMethod == "AutoBasedOnGCP") ? (numCoordinates >= 3 && numCoordinates < 6) ? geoRef.rectifyMethod = "1stOrderPolyn" : (numCoordinates >= 6 && numCoordinates < 10) ? geoRef.rectifyMethod = "2ndOrderPolyn" : geoRef.rectifyMethod = "3rdOrderPolyn" : null;

          // Get new georefenced file name from the user
          geoRef.newFileName = vm.geoRefFilename;

          // Crop final georeferenced image
          if(vm.manualExtent) {
            geoRef.bboxCropImage = vm.minx +" "+ vm.miny +" "+ vm.maxx +" "+ vm.maxy;
            // console.log(geoRef.bboxCropImage)
          } else {
            geoRef.bboxCropImage = "";
          }

          $rootScope.$broadcast('previewGcp', geoRef);
        } else {
          // closing left sidenav since it was overlaping alert message
          close();
          var config = {
            title: $translate.instant('dialog.cantPreviewGcptableTitle'),
            description: $translate.instant('dialog.cantPreviewGcptableText'),
            toolbarBgColor:$mdColors.getThemeColor('primary'),
            okBgColor:$mdColors.getThemeColor('primary'),
            ok: $translate.instant('global.ok')
          };
          C2Dialog.alert(config);
        }
      } else {
        var config = {
          title: $translate.instant('dialog.invalidGeorefTitle'),
          description: $translate.instant('dialog.invalidGeorefText'),
          toolbarBgColor:$mdColors.getThemeColor('primary'),
          okBgColor:$mdColors.getThemeColor('primary'),
          ok: $translate.instant('global.ok')
        };
        C2Dialog.alert(config);
      }
    }

    function removeGcpTable() {
      // console.log(">>> ge.left.sidenav.controller >>> removeGcpTable ");
      angular.element( document.querySelector( '#gcpTable' ) ).empty();
    }
    /**
     * Starts the drawing interaction to draw a rectangle on left map to crop the image
     * 
     * Alternatively, COMMENTED CODE is for showing the extent rectangle on right map
     * 
     */
    function drawRectangleForExtent() {
      // console.log(">>> ge.left.sidenav.controller >>> drawRectangleForExtent ");
      close();
      C2Toast.success($translate.instant('messages.georefStartRectangleExtent'));
      var viewerId = "leftMapViewer";
      // disble marker creation by firing an event to Georeference controller
      $rootScope.$broadcast('toggleMarkerCreation', {'markersKeeper' : viewerId});
      
      leafletData.getMap(viewerId).then(function (map) {
        // Approach 2 : draw extent rectangle on right Map and let the user by able to edit it
        // if(map.hasLayer(drawnItems)){
        //   console.log(drawnItems);
        // }
        // var drawnItems = new L.FeatureGroup();

        // // drawnItems.forEach(function(layer) {
        // //   console.log(layer);
        // //   map.removeLayer(layer);
        // // });
        // // create a rectangle based on extend calculated
        // var extentRect = L.rectangle([[vm.miny, vm.minx], [vm.maxy, vm.maxx]]).addTo(drawnItems);
        // console.log(extentRect);
        // extentRect.type = extentRect.type || "Feature"; // Intialize feature.type
        // var props = extentRect.properties = extentRect.properties || {}; // Intialize feature.properties
        // props.title = "extentRectangleForCropping";
        // // props.content = "my content";
        // extentRect.editing.enable();
        // map.on('draw:editresize', function (e) {
        //   console.log("draw:editresize ", e.layer);
        //   vm.minx = e.layer.getBounds().getWest();
        //   vm.miny = e.layer.getBounds().getSouth();
        //   vm.maxx = e.layer.getBounds().getEast();
        //   vm.maxy = e.layer.getBounds().getNorth();
        // }.bind(drawnItems));
        // map.addLayer(drawnItems);
      
        // Approach 2 : Let the User draw rectangle on Left Map
        // FeatureGroup is to store editable layers
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        var polygonDrawer = new L.Draw.Rectangle(map);     
        polygonDrawer.enable();

        map.on('draw:created', function (e) {
          var layer = e.layer;
          layer.type = layer.type || "Feature"; // Intialize feature.type
          var props = layer.properties = layer.properties || {}; // Intialize feature.properties
          props.title = "extentRectangleForCropping";
          
          drawnItems.addLayer(layer);
          // var drawsGeoJson = layer.toGeoJSON();
          // console.log("poygon geojson = ", drawsGeoJson);
          vm.minx = layer.getBounds().getSouthWest().lng;
          vm.miny = layer.getBounds().getSouthWest().lat;
          vm.maxx = layer.getBounds().getNorthEast().lng;
          vm.maxy = layer.getBounds().getNorthEast().lat;
          // open the sidenav
          // open();
          // console.log("vm.minx = ", vm.minx, vm.miny, vm.maxx, vm.maxy);
        }.bind(drawnItems));
      });
    }

    /** 
     * If any rectangle drawn on left map than clears it and 
     * reinitializes min, max values to null
     */
    function cleanUp() {
      // console.log(">>> ge.left.sidenav.controller >>> cleanUp");
      // alway display extent rectangle in Right map
      var viewerId = "leftMapViewer";
      leafletData.getMap(viewerId).then(function (map) {
        lodash.forEach(map._layers, (feature)=> {
          if(typeof feature.type !== "undefined") {
            if(feature.type === "Feature") {
              // console.log(feature);
              // feature.removeFrom(drawnItems);
              // feature.remove();
              map.removeLayer(feature);
            }
          }
        });
      });
      vm.minx = vm.miny = vm.maxx = vm.maxy = null;
    }

    /**
     * Removes Extent rectanlg from Right map before drawing a new one
     * **** Unused code, good for callback example
     */
    function removeExtentRectangle(callback) {
      console.log(">>> ge.left.sidenav.controller >>> removeExtentRectangle");
      // alway display extent rectangle in Right map
      var viewerId = "rightMapViewer";
      leafletData.getMap(viewerId).then(function (map) {
        // check if rectangle already drawn, if yes than remove it
        lodash.forEach(map._layers, (feature)=> {
          if(typeof feature.type !== "undefined") {
            if(feature.type === "Feature") {
              console.log(feature);
              // feature.removeFrom(drawnItems);
              // feature.remove();
              map.removeLayer(feature);
            }
          }
        });
      });
      callback();
    }

    activate();
    
  }

})();