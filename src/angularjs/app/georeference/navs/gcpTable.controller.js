(function () {
  
    'use strict';
  
    angular
      .module('app')
      .controller('GcpTableController', GcpTableController);
  
    /** @ngInject */
    // eslint-disable-next-line max-params
    function GcpTableController($scope, $rootScope, $translate, C2Dialog, $mdColors, Global, GeoreferenceService, lodash) {
      var vm = this;
      vm.deleteGCPFromTable = deleteGCPFromTable;
      vm.deleteGCPFromMap = deleteGCPFromMap;
      vm.refreshGCPTable = refreshGCPTable;
      vm.avgRmse = null;
      $scope.showTable = false;
      $scope.tableData = [];
      $scope.paginationLimit = 5;
      $scope.paginationCurrentPage = 1;

      // global variable used for refresh
      vm.geoRef = null;

      $rootScope.$on('previewGcp', function(event, args){           
        // console.log(">>> GcpTableController >>> previewGcpEvent", args);
        previewGcp(args);
      });

      $rootScope.$on('deleteGcpFromTableEvent', function(event, args){           
        // console.log(">>> GcpTableController >>> deleteGcpFromTableEvent", args);
        deleteGCPFromTable(args);
      });

      $rootScope.$on('refreshGcpTableEvent', function(event, args){           
        // console.log(">>> GcpTableController >>> refreshGcpTableEvent", args);
        refreshGCPTable();
      });

      $rootScope.$on('clearGcp', function(event, args){           
        // console.log(">>> GcpTableController >>> clearGcp", args);
        clearData();
      });

      /**
       * Start of the GCP Table controller
       * 
       */
      function init() {
          // console.log(">>> GcpTableController >>> init");
          // previewGcp();
      }

      function previewGcpInTable(tableData) {
        // console.log(">>> GcpTableController >>> previewGcpInTable", tableData);
        // $scope.tableData = result.items[3];
      }

      /**
       * Call the RMSE api to calculate the RMS error for each GCPoints
       * and fill the GCP table below to response data and creates marker on Left and Right Map
       * 
       * @param {object} geoRef
       */
      function previewGcp(geoRef) {
        // console.log(">>> GcpTableController >>> previewGcp");
        // $scope.showTable = true;
        // var geoRef = new GeoreferenceService();
        if(!vm.geoRef) {
          vm.geoRef = geoRef;
        }
        
        geoRef.previewGCP(geoRef)
          .then(function(result){
            // console.log("result from API ", result);
            $scope.tableData = result.items[3];
            if(angular.isDefined(result.items[2]["average error"])) {
              vm.avgRmse = result.items[2]["average error"];
            }
            // console.log("result from API ", $scope.tableData);
            //create marker object as required by leaflet marker object
            $scope.showTable = true;  
            lodash.forEach($scope.tableData, function(markerFromDB) {
              // remove "m" from id attribute
              markerFromDB.gcpNo = markerFromDB.id[1];
              // markers for left map ie Non georeference
              // generateLeftMarker(markerFromDB, function() {
              //   generateRightMarker(markerFromDB);
              // });
            });
          }, function(err){
            console.log(err)
            // the code inside this block will be fired if some error occur
            // here you can show some error message or do nothing, depending on the business rule
    
            //TODO: notify the user about the error?
          });
      }

      /**
       * Generate markers on Left Map
       * 
       * To be used when a user wants to view his or someone else's GCP
       * 
       * @param {object} markerFromDB
       * @param {object} callback
       */
      function generateLeftMarker(markerFromDB, callback) {
        var marker = null;
          marker = {
          "draggable": true,
          // "icon": {type: "div", className: "mk-div-icon "+markerFromDB.id, iconSize: null, html: "<div class=\"mk-icon-container mk-ok\">"+ tempMarkerNo +"</div>"},
          "id": markerFromDB.id,
          "latlng": {
            "lat": markerFromDB.imageX,
            "lng": markerFromDB.imageY,
          },
          "message": undefined,
          "markersKeeper": "leftMarkers"
        }
      
        // console.log("throw marker to georeference.controller ", marker);
        $rootScope.$broadcast('createMarkerForTable', marker);
        // a delay of 10 millseconds for letting the markers be rendered on map and then firing for another map
        setTimeout(function() {
          callback();
        }, 10);
        
      }

      /**
       * Generate markers on Right Map
       * 
       * To be used when a user wants to view his or someone else's GCP
       * 
       * @param {object} markerFromDB
       */
      function generateRightMarker(markerFromDB) {
        var marker = null;
        
        marker = {
          "draggable": true,
          // "icon": {type: "div", className: "mk-div-icon "+markerFromDB.id, iconSize: null, html: "<div class=\"mk-icon-container mk-ok\">"+ tempMarkerNo +"</div>"},
          "id": markerFromDB.id,
          "latlng": {
            "lat": markerFromDB.lat,
            "lng": markerFromDB.lon,
          },
          "message": undefined,
          "markersKeeper": "rightMarkers"
        }
      
        // console.log("throw marker to georeference.controller ", marker);
        $rootScope.$broadcast('createMarkerForTable', marker);
      }

      /**
       * delete event fired from GCP Table to delete the GCP from Left and Right Map 
       * 
       * @param {string} gcpId
       */
      function deleteGCPFromMap(gcpId) {
        // console.log(">>> GcpTableController >>> deleteGCPFromMap ", gcpId, $scope.tableData);
        // check if gcpId aexist in Table data
        // console.log(_.find($scope.tableData, ['id', gcpId]));
        if(_.find($scope.tableData, ['id', gcpId])) {
          // TODO : call some event to delete markers from both the maps 
          var temp = {
            model: {
              id: gcpId,
              eventFrom: "gcpTable"
            }
          };
          // fire a event to remove markers from maps
          $rootScope.$broadcast("leafletDirectiveMarker.leftMapViewer.click", temp);
          // $rootScope.$broadcast("leafletDirectiveMarker.leftMapViewer.click", temp);
          // delete from table
          $scope.tableData = _.filter($scope.tableData, function(o) { return !(o.id === gcpId); });
          // console.log("filteredTableData = ", $scope.tableData);
        }
        refreshGCPTable();
      }

      /**
       * Delete event fired from map to delete the GCP from Table 
       * 
       * @param {string} gcpId
       */
      function deleteGCPFromTable(gcpId) {
        // console.log(">>> GcpTableController >>> deleteGCPFromTable ", gcpId, $scope.tableData);
        // check if gcpId aexist in Table data
        // console.log(_.find($scope.tableData, ['id', gcpId]));
        if(_.find($scope.tableData, ['id', gcpId])) {
          $scope.tableData = _.filter($scope.tableData, function(o) { return !(o.id === gcpId); });
          // console.log("filteredTableData = ", $scope.tableData);
        }
        refreshGCPTable();
      }

      /**
       * Refresh GCP from Table with current GCP
       * 
       */
      function refreshGCPTable() {
        // console.log(">>> GcpTableController >>> refreshGCPTable ", vm.geoRef);
        if(vm.geoRef) {
          $scope.showTable = false;
          if(_.size(vm.geoRef.imageCoordinates) >= 3 && _.size(vm.geoRef.worldCoordinates) >= 3) {
            // check if both the maps have same number of GCPs
            if(_.size(vm.geoRef.imageCoordinates) === _.size(vm.geoRef.worldCoordinates)) {
              // console.log(_.size(vm.geoRef.imageCoordinates) + " - "+ _.size(vm.geoRef.worldCoordinates))
              previewGcp(vm.geoRef);
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
        }
      }

      function clearData() {
        vm.geoRef = null;
        $scope.showTable = false;
        $scope.tableData = [];
      }

      init();
    }
}) ();