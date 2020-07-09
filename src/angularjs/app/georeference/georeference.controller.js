(function () {
  
    'use strict';
  
    angular
      .module('app')
      .controller('GeoreferenceController', GeoreferenceController);
  
    /** @ngInject */
    // eslint-disable-next-line max-params
    function GeoreferenceController($controller, $scope, MapMarkerService, leafletMarkerEvents, $rootScope, MapViewerService, $translate, C2Dialog, $mdColors, $mdSidenav, Global, $timeout, lodash) {
      var vm = this;
  
      // Functions Block     
      vm.onViewerActivate = onViewerActivate;
      vm.toggleCreateMarker = toggleCreateMarker;
      vm.beforeViewerActivate = beforeViewerActivate;
      vm.toggleRemoveMarker = toggleRemoveMarker;
      vm.openSaveGeoRef = openSaveGeoRef;
      vm.validGCP = validGCP;
      vm.numOfGCP = numOfGCP;
      vm.redrawMarkers = redrawMarkers;

      // Set the map viewer options
      var options = {
        supportListingView : false,
        supportDrawing : false,
        titleTranslKey : 'views.titles.mapGeoreferencing',
        showGeoRefTools : true,
        leftSideBar: Global.clientPath + '/georeference/navs/geo-left-sidenav.html',
        showGcpTable: true,
        gcpTable: Global.clientPath + '/georeference/navs/gcp-Table.html'
      };

      // initialize empty markers object
      vm.rightMarkers = {};
      vm.leftMarkers = {};
  
      // instantiate the base MapViewerController
      $controller('MapViewerController', { vm: vm, $scope: $scope, options});
      
      // Listen to the rightMapViewer dragend
      $rootScope.$on('leafletDirectiveMarker.rightMapViewer.dragend', function(event, args){           
        if(vm.rightCreateMarkerEnable === true){
          // doing nothing for a while
        }       
      });

      // Listen to the rightMapViewer click and remove the marker if the removal tool is enabled
      $rootScope.$on('leafletDirectiveMarker.rightMapViewer.click', function(event, args){           
        if(vm.rightRemoveMarkerEnable === true){
          var id = args.model.id;
          removeMarker(id);
          // call an event to delete it from GCP Table
          $rootScope.$broadcast("deleteGcpFromTableEvent", id);
        } else {
          // ensure the event is fired from GCP Table delete button
          if(args.model.eventFrom === "gcpTable") {
            var id = args.model.id;
            // console.log(id)
            removeMarker(id);
          }
        }
      });

      // Listen to the leftMapViewer click and remove the marker if the removal tool is enabled
      $rootScope.$on('leafletDirectiveMarker.leftMapViewer.click', function(event, args){           
        if(vm.leftRemoveMarkerEnable === true){
          var id = args.model.id;
          // console.log(id)
          removeMarker(id);         
          // call an event to delete it from GCP Table
          $rootScope.$broadcast("deleteGcpFromTableEvent", id);
        } else {
          // ensure the event is fired from GCP Table delete button
          if(args.model.eventFrom === "gcpTable") {
            var id = args.model.id;
            // console.log(id)
            removeMarker(id);
          }
        }
      });

      // Listen to the rightMapViewer click and add a marker on the clicked position
      // if the marker creation tool is enabled
      $rootScope.$on("leafletDirectiveMap.rightMapViewer.click", function(event, args){        
        if(vm.rightCreateMarkerEnable === true){        
          addMarker(args.leafletEvent, 'rightMarkers');
          // ensure both the maps have equal number of markers
          if(lodash.size(vm['leftMarkers']) === _.size(vm['rightMarkers'])) {
            // fire event to GCP controller for caqll refreshGCPTable
            $rootScope.$broadcast("refreshGcpTableEvent");
          }
        } 
      });

      // Listen to the leftMapViewer click and add a marker on the clicked position
      // if the marker creation tool is enabled
      $rootScope.$on("leafletDirectiveMap.leftMapViewer.click", function(event, args){        
        if(vm.leftCreateMarkerEnable === true){         
          addMarker(args.leafletEvent, 'leftMarkers');
          // ensure both the maps have equal number of markers
          if(_.size(vm['leftMarkers']) === _.size(vm['rightMarkers'])) {
            // console.log("marker siye equal on both maps");
            // fire event to GCP controller for caqll refreshGCPTable
            $rootScope.$broadcast("refreshGcpTableEvent");
          }
        } 
      });

      // Listen to the rightMapViewer click and add a marker on the clicked position
      // if the marker creation tool is enabled
      $rootScope.$on("createMarkerForTable", function(event, args){  
        // console.log(">>> georeference.controller >>> createMarkerForTable ", args);
        if(args.markersKeeper === "leftMarkers") {
          addMarker(args, 'leftMarkers');
        }
        if(args.markersKeeper === "rightMarkers") {
          addMarker(args, 'rightMarkers');
        }
      });

      // Listen to the disable marker creation 
      $rootScope.$on("toggleMarkerCreation", function(event, args){  
        // console.log(">>> georeference.controller >>> toggleMarkerCreation ", args);
        var markersKeeper = args.markersKeeper; // 'leftMapViewer'
        toggleCreateMarker(markersKeeper);
      });

      // Listen to create markers on map based on GCP positions
      $rootScope.$on("createGcpOnMap", function(event, args){  
        // console.log(">>> georeference.controller >>> createGcpOnMap ", args);
        
        lodash.forEach(args, function(position) {
          var preparedMarkerData = prepareDataForAddMarker(position);
          addMarker(preparedMarkerData.imagePosition, 'leftMarkers');
          
          // delay is added otherwise only one of the map has markers on it
          setTimeout(function() {
            addMarker(preparedMarkerData.mapPosition, 'rightMarkers');  
          }, 10);
        });
        
      });

      /**
       * Add a marker on a given markers keeper object
       * 
       * @param {any} leafEvent 
       * @param {any} markersKeeper 
       */
      function addMarker(leafEvent, markersKeeper){        
        var markerData = {
          lat: leafEvent.latlng.lat,
          lng: leafEvent.latlng.lng,
          focus: true                                  
        };

        var newMarker = MapMarkerService.buildMarker(vm[markersKeeper], markerData);       
        vm[markersKeeper][newMarker.id] = newMarker; 
      }

      /**
       * Remove a given marker id from bot viewers
       * 
       * @param {any} markerId 
       */
      function removeMarker(markerId){        
        if(angular.isDefined(vm.leftMarkers[markerId])){
          // var tempMarkerId = vm.leftMarkers[markerId].icon.className.split(" ")[1];
          delete vm.leftMarkers[markerId];
          // redrawMarkers(vm.leftMarkers, tempMarkerId);
        }
        if(angular.isDefined(vm.rightMarkers[markerId])){
          var tempMarkerId = vm.rightMarkers[markerId].icon.className.split(" ")[1];
          // added a timeout other wise, after deleting marker on leftside map and then creating a 
          // marker on rightside was not in-sync
          // setTimeout(() => {
            delete vm.rightMarkers[markerId];
          //   redrawMarkers(vm.rightMarkers, tempMarkerId);    
          // }, 10);
        }
      }

      /**
       * Redraw/updates a given map (markerskeeper - object) all the markers 
       * except the deleted one
       * 
       * @param {any} markersKeeper 
       * @param {any} deletedMarkerId 
       */
      function redrawMarkers(markersKeeper, deletedMarkerId) {        
        
        // console.log(">>>georeferenceControlller >>> redrawMarkers ", markersKeeper, deletedMarkerId[1]);
        _.forOwn(markersKeeper, function (marker, key) {
          var tempIdNum = marker.icon.className.split(" ")[1][1];
          if(tempIdNum > deletedMarkerId[1]) {
            var newMarkerNo = tempIdNum - 1;  
            // ui changes of marker icon
            marker.icon.html = "<div class=\"mk-icon-container mk-ok\">"+ newMarkerNo + "</div>"
            marker.icon.className = "mk-div-icon m"+ newMarkerNo;
            
            // change the old key of the marker with new one, otherwise the newly created marker's numbering 
            // will not be in sync
            var oldKey = key; 
            var newKey="m" + newMarkerNo; 
            if (oldKey !== newKey) {
              Object.defineProperty(markersKeeper, newKey, 
                Object.getOwnPropertyDescriptor(markersKeeper, oldKey));
              delete markersKeeper[oldKey];
            }
            // console.log("marker = ", marker);
          }
        });
      }

      /**
       * Actions executed before the base viewer is activated
       * 
       */
      function beforeViewerActivate(){  
        
        // activate the event listening for right viewer and right marker events
        vm.rightViewerEvents = {
          markers: {
            enable: leafletMarkerEvents.getAvailableEvents(),
          },
          map: {
            enable: ['dragend', 'drag', 'click', 'mousemove'],
            //logic: 'emit'
          }
        };
        // activate the event listening for left viewer and left marker events
        vm.leftViewerEvents = {
          markers: {
            enable: leafletMarkerEvents.getAvailableEvents(),
          },
          map: {
            enable: ['dragend', 'drag', 'click', 'mousemove'],
            //logic: 'emit'
          }
        }       
      }

      /**
       * Actions executed after the base viewer is activated
       * 
       */
      function onViewerActivate(){ 
        // Set global viewer options
        // changed for resolving #184 
        // MapViewerService.setOption('rightMapViewer', 'showLoadMapInRight', false);
        MapViewerService.setOption('rightMapViewer', 'showLoadMapInRight', true);
        MapViewerService.setOption('leftMapViewer', 'showLoadMapInRight', true);
      }

      /**
       * Enable/disable the marker creation
       * 
       * @param {any} viewerId 
       */
      function toggleCreateMarker(viewerId){
        if(viewerId === 'rightMapViewer') {
          vm.rightCreateMarkerEnable = !vm.rightCreateMarkerEnable;

          // it is not possible to have removal and create tool enabled at the same time
          // so, if the removal and create tool are enabled, the right removal tool is disabled
          if(vm.rightCreateMarkerEnable === true && vm.rightRemoveMarkerEnable === true) {
            vm.rightRemoveMarkerEnable = false;
          }          
        } else {
          vm.leftCreateMarkerEnable = !vm.leftCreateMarkerEnable;

          // it is not possible to have removal and create tool enabled at the same time
          // so, if the removal and create tool are enabled, the left removal tool is disabled
          if(vm.leftCreateMarkerEnable === true && vm.leftRemoveMarkerEnable === true){
            vm.leftRemoveMarkerEnable = false;
          }
        }        
      }

      /**
       * Enable/disable the marker removal
       * 
       * @param {any} viewerId
       */
      function toggleRemoveMarker(viewerId){
        if(viewerId === 'rightMapViewer') {
          vm.rightRemoveMarkerEnable = !vm.rightRemoveMarkerEnable;

          // it is not possible to have removal and create tool enabled at the same time
          // so, if the removal and create tool are enabled, the right create tool is disabled
          if(vm.rightRemoveMarkerEnable === true && vm.rightCreateMarkerEnable === true){
            vm.rightCreateMarkerEnable = false;
          }          
        } else {
          vm.leftRemoveMarkerEnable = !vm.leftRemoveMarkerEnable;

          // it is not possible to have removal and create tool enabled at the same time
          // so, if the removal and create tool are enabled, the left create tool is disabled
          if(vm.leftRemoveMarkerEnable === true && vm.leftCreateMarkerEnable === true){
            vm.leftCreateMarkerEnable = false;
          }
        }        
      }

      /**
       * Opens the side nav with save options for the georeference
       * This function just open the side nav. The georeference save function is defined 
       * in the side nav controller @see app/georeference/navs.geo.left.sidenav.controller.js
       */
      function openSaveGeoRef(){
        // if the Ground Control Points are valid, we just open the side nav
        if(validGCP()){
          $scope.vm = vm;
          $mdSidenav('left').toggle();
          $rootScope.$emit('saveGeoRef', vm.leftMarkers);
        } else { // if not, we warn the user about it
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
       * 
       */
      function numOfGCP(){
        return Object.keys(vm.leftMarkers).length;
      }

      /**
       * Validate the Ground Control Points about to be used for the georeference
       * 
       * @returns 
       */
      function validGCP(){ 
        // get the properties count of both viewers
        var leftCount = Object.keys(vm.leftMarkers).length;
        var rightCount = Object.keys(vm.rightMarkers).length;

        // to be valid a minimum of 3 GCP must be selected 
        // and both viewers must have the same amount of GCP defined
        return leftCount >= 3 &&  leftCount === rightCount;
      }
      
      /**
       * Convert GCP data received from /map response to marker format data
       * 
       * @param position gcp response of /map request
       * @returns Object In format how addMarker function needs marker data
       */
      function prepareDataForAddMarker(position) {
        var imagePositionInLatLng = L.Projection.SphericalMercator.unproject(
          // L.latLng(position.pixelY,parseFloat(position.pixelX))
          L.point(parseFloat(position.pixelX), position.pixelY)
        );
        // console.log(imagePositionInLatLng);

        return {
          "imagePosition" : {
            "latlng": {
              "lat": imagePositionInLatLng.lat,
              "lng": imagePositionInLatLng.lng
            }
          },
          "mapPosition" : {
            "latlng": {
              "lat": position.lat,
              "lng": position.lon
            }
          }
        };
      }
    }
  
  })();