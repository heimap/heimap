(function () {

  'use strict';

  angular
    .module('app')
    .controller('VectorRightSidenavController', VectorRightSidenavController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function VectorRightSidenavController($mdSidenav, lodash, $rootScope, leaflet, leafletData, FeatureService, $sessionStorage, VectorService, MapLayerService) {
    var vm = this;

    vm.showAttributes = showAttributes;
    vm.update = update;
    vm.close = close;
    vm.open = open;
    vm.showAllFeatureVersions = showAllFeatureVersions;
    vm.toggleRight = toggleRight;
    vm.checkDependentValue = checkDependentValue;
    vm.getFormAttribute = getFormAttribute;
    vm.featureAttr = null;
    vm.gazzTypes = ["Physical Thing", "Event", "Place"];
    vm.editMode = null; // "edit", "create", "delete"
    vm.currentLayer = null;
    vm.createParam = {
      "action": "create",
      "data":[]
    };
    vm.editParam = {
      "action": "edit",
      "data": []
    };
    vm.deleteParam = {
      "action": "delete",
      "data": []
    };
    vm.disableSave = false;
    vm.showAllVersions = true;
    vm.formParams = null;

    // used for Edit feature call (attribute update)
    $rootScope.$on('showFeatureAttr', function(event, args){
      // console.log(">>> VectorRightSidenavController >>> showFeatureAttr ", args);
      vm.featureAttr = null;
      // close and open to let the divs refresh
      close();
      vm.editMode = "edit";
      vm.currentFeature = args;
      args = FeatureService.createObjectFromGeoJson(args);
      // check whether feature already exist in vm.editParam
      if(vm.editParam.data.length > 0) {
        var tempObj = searchFromCollectionToFeature(args, vm.editParam);
        if(tempObj !== null) {
          tempObj.type_crm = vm.currentFeature.properties.type_crm;
          args = tempObj;
        }
      }
      showAttributes(args);
      open();
      if(vm.currentLayer !== null) {
        if(vm.currentLayer.layerId === vm.currentFeature.properties.layerName) {
          // check for user's access on this feature
          // console.log(checkUserAccessOnFeature(vm.currentFeature, $sessionStorage.getObject("userId").toString()));
          if(checkUserAccessOnFeature(vm.currentFeature, $sessionStorage.getObject("userId").toString())) {
            vm.disableSave = false;
          } else {
            vm.disableSave = true;
          }
        } else {
          vm.disableSave = true;
        } 
      } else {
        vm.disableSave = true;
      }
      vm.showAllVersions = true;
    });

    // geom update
    $rootScope.$on('geomUpdated', function(event, args){
      // console.log(">>> VectorRightSidenavController >>> addFeatureToUpdate ", args);
      args.eachLayer(function (layer) {
        // console.log(layer);
        // replace feature geom with the new editted geom value
        // layer.feature.geometry.coordinates = Object.values(layer.getLatLng());
        layer.feature.geometry = layer.toGeoJSON().geometry;
        vm.currentFeature = layer.feature;
        // addFeatureToUpdateList(layer.feature);
        // ------
        if(vm.createParam.data.length > 0) {
          // find editted feature in editParam 
          var foundObjectInCreateParam = lodash.find(vm.createParam.data, function(eachFeature){
            return (parseInt(layer.feature.properties.type_crm) === eachFeature.type_crm || 
            layer.feature.properties.type_crm === eachFeature.type_crm) 
          });
          if(typeof foundObjectInCreateParam !== "undefined") {
            // console.log("found in createParam ", foundObjectInCreateParam);
            searchAndReplaceOnlyGeom(layer.feature, vm.createParam);
            // addFeatureToUpdateList(layer.feature);
            // fire back to left sidenav to add newly added feature to its layer
            // $rootScope.$broadcast("addFeatureToLayer", vm.currentFeature);
            $sessionStorage.setObject("createParam", vm.createParam);
          } else {
            // handleEditParam(vm.featureAttr, vm.editParam, vm.currentFeature);
            addFeatureToUpdateList(layer.feature);
            $sessionStorage.setObject("editParam", vm.editParam);
          }
        } else {
          // handleEditParam(vm.featureAttr, vm.editParam, vm.currentFeature);
          addFeatureToUpdateList(layer.feature);
          $sessionStorage.setObject("editParam", vm.editParam);
        }
      });
    });

    // used for create feature call
    $rootScope.$on('openRightNav', function(event, args){
      // console.log(">>> VectorRightSidenavController >>> openRightNav ", args);
      vm.featureAttr = null;
      close();
      vm.editMode = args.data.operation;
      vm.currentLayer = args.data.layer;
      vm.currentLeafFeature = args.data.feature;
      vm.currentFeature = args.data.feature.toGeoJSON();
      vm.disableSave = false;
      open();
    });

    // used for delete feature call
    $rootScope.$on('featureDeleted', function(event, args){
      // console.log(">>> VectorRightSidenavController >>> featureDeleted ", args);
      var layers = args.data.features;
      layers.eachLayer(function (layer) {
        // check for it exist in create or edit collection
        if((searchInCollection(vm.createParam, layer) === false) && (searchInCollection(vm.editParam, layer) === false)) {
          var tempDeleteData = {
            "layer_id": vm.currentLayer.layerId,
            "type_crm": layer.feature.properties.type_crm
          };
          vm.deleteParam.data.push(tempDeleteData);
        } else {
          if(searchInCollection(vm.createParam, layer)) {
            // delete it from that collection
            deleteFeatureFromCollection(layer, vm.createParam);
            // console.log("vm.createParam = ", vm.createParam);
            $sessionStorage.setObject("createParam", vm.createParam);
          } 
          if(searchInCollection(vm.editParam, layer)) {
            // console.log(">>> got a feature in collection");
            // delete it from that collection
            deleteFeatureFromCollection(layer, vm.editParam);
            // console.log("vm.editParam = ", vm.editParam);
            $sessionStorage.setObject("editParam", vm.editParam);
            // since a edited feature is deleted that means its a simple delete
            var tempDeleteData = {
              "layer_id": vm.currentLayer.layerId,
              "type_crm": layer.feature.properties.type_crm
            };
            vm.deleteParam.data.push(tempDeleteData);
          } 
        }
      });
      // console.log("vm.deleteParam = ", vm.deleteParam);
      $sessionStorage.setObject("deleteParam", vm.deleteParam);
    });

    // Assign current Editing layer
    $rootScope.$on('setCurrentEditLayer', function(event, args){
      // console.log(">>> VectorRightSidenavController >>> setCurrentEditLayer ", args);
      vm.currentLayer = args.data.layer;
    });

    /**
     * First function called after the controller is ran
     * here the stuff are initialized
     * 
     */
    function activate() {
      // console.log(">>> vector.right.sidenav.controller >>> activate ", vm);
    }

    /**
     * Close this sidenav
     * 
     */
    function close () {
      $mdSidenav('right').close();
      vm.editMode = null;
      vm.currentFeature = null;
    }    

    /**
     * Open this sidenav
     * 
     */
    function open () {
      $mdSidenav('right').open();
    }

    /**
     * Displays feature's attribute in right-side-nav. Called from event broadcast from 
     * vector.left.sidenav.controller
     * 
     */
    function showAttributes(featureObject) {
      // console.log(">>> VectorRightSidenavController >>> showFeatureAttr() ", featureObject);
      // check if any value contains [] for attribute types like "Language" where values will be an array
      var tempFValObj = Object.values(featureObject);
      var tempFKeyObj = Object.keys(featureObject);
      for(var i=0; i < tempFValObj.length; i++) {
        if(typeof tempFValObj[i] === "string") {
          if(tempFValObj[i].indexOf("[") !== -1) {
            featureObject[tempFKeyObj[i]] = JSON.parse(tempFValObj[i]);
          }
        }
      }
      
      vm.featureAttr = featureObject;
      getFormAttribute();
    }

    /**
     * Called when geom update is performed on feature. Expects 1 feature at a time. 
     * Hence called in loop from the caller. 
     * Checks for Edit + Edit scenarios, mentioned in Test cases of #225.
     * Doesn't returns anything but updates the vm.editParam
     * 
     * @param {any} feature
     */
    function addFeatureToUpdateList(feature) {
      // console.log(">>> VectorRightSidenavController >>> addFeatureToUpdateList ", feature);
      if(vm.editParam.data.length > 0) {
        // find editted feature in editParam 
        var foundObjectInEditParam = lodash.find(vm.editParam.data, function(eachFeature){
          return (parseInt(feature.properties.type_crm) === eachFeature.type_crm || 
          feature.properties.type_crm === eachFeature.type_crm) 
        });
        // if found than replace it in ediParam else its a new feature push to editParam
        // console.log("foundObjectInEditParam = ", foundObjectInEditParam);
        if(typeof foundObjectInEditParam !== "undefined") {
          // searchAndReplace(feature, vm.editParam);
          // lodash.remove(vm.editParam.data, function(eachFeature){
          //   return (parseInt(feature.type_crm) === eachFeature.type_crm || 
          //   feature.type_crm === eachFeature.type_crm) 
          // });
          searchAndReplaceOnlyGeom(feature, vm.editParam);
        } else {
          var tempFeature = {
            "layer_id": vm.currentLayer.layerId,
            "key_cidoc_array": feature.properties.key_cidoc_array.split("|"),
            "value_gazetteer_array": feature.properties.value_gazetteer_array.split("|"),
            "type_crm": feature.properties.type_crm
          }
          tempFeature.key_cidoc_array.push("geom");
          tempFeature.value_gazetteer_array.push(feature.geometry);
          vm.editParam.data.push(tempFeature);
        }
      } else {
        var tempFeature = {
          "layer_id": vm.currentLayer.layerId,
          "key_cidoc_array": feature.properties.key_cidoc_array.split("|"),
          "value_gazetteer_array": feature.properties.value_gazetteer_array.split("|"),
          "type_crm": feature.properties.type_crm
        }
        tempFeature.key_cidoc_array.push("geom");
        tempFeature.value_gazetteer_array.push(feature.geometry);
        vm.editParam.data.push(tempFeature);
      }
      // console.log("vm.editParam = ", vm.editParam);
      $sessionStorage.setObject("editParam", vm.editParam);
    }

    /**
     * Save function. Called when Save button in right-saide-nav is clicked, updated vm.createParam
     * and vm.editParam.
     * Not for Delete features, since this handles majorly only for Attribute Save/Update
     * 
     */
    function update() {
      // console.log(">>> VectorRightSidenavController >>> update >>> ", vm.editMode, vm.currentLayer, vm.featureAttr, vm.currentFeature);
      if(vm.editMode === "create") {
        // vm.featureAttr.type_crm = "crm_" + Math.floor(Math.random() * (9999 - 1 + 1)) + 1;
        var tempCrm = "crm_" + Math.floor(Math.random() * (9999 - 1 + 1)) + 1;
        var apiParamFormat = convertJsonToApiReqObj(vm.featureAttr, vm.currentFeature);
        var tempFeature = {
          "layer_id": vm.currentLayer.layerId,
          "key_cidoc_array": apiParamFormat.keys,
          "value_gazetteer_array": apiParamFormat.values,
          "type_crm": tempCrm
        }
        vm.createParam.data.push(tempFeature);
        // create the vm.currentFeature in same style as we receive it from wfs layer call
        // vm.currentFeature.properties = vm.featureAttr;
        vm.currentFeature.properties = {
          "key_cidoc_array": convertToSSV(apiParamFormat.keys),
          "value_gazetteer_array": convertToSSV(apiParamFormat.values),
          "type_crm": tempCrm
        };
        vm.currentLeafFeature.feature = vm.currentFeature;
        // console.log("vm.currentLeafFeature = ", vm.currentLeafFeature);
        // fire back to left sidenav to add newly added feature to its layer
        $rootScope.$broadcast("addFeatureToLayer", vm.currentLeafFeature);
        $sessionStorage.setObject("createParam", vm.createParam);
      }
      else if(vm.editMode === "edit") {
        // check if current feature already exist in vm.createParam
        if(vm.createParam.data.length > 0) {
          // find editted feature in editParam 
          var foundObjectInCreateParam = lodash.find(vm.createParam.data, function(eachFeature){
            return (parseInt(vm.featureAttr.type_crm) === eachFeature.type_crm || 
              vm.featureAttr.type_crm === eachFeature.type_crm) 
          });
          if(typeof foundObjectInCreateParam !== "undefined") {
            // console.log("found in createParam ", foundObjectInCreateParam);
            searchAndReplace(vm.featureAttr, vm.createParam);
            var apiParamFormat = convertJsonToApiReqObj(vm.featureAttr, vm.currentFeature);
            vm.currentFeature.properties = {
              "key_cidoc_array": convertToSSV(apiParamFormat.keys),
              "value_gazetteer_array": convertToSSV(apiParamFormat.values),
              "type_crm": vm.featureAttr.type_crm
            };
            vm.currentLeafFeature.feature = vm.currentFeature;
            // fire back to left sidenav to add newly added feature to its layer
            $rootScope.$broadcast("addFeatureToLayer", vm.currentLeafFeature);
            $sessionStorage.setObject("createParam", vm.createParam);
          } else {
            handleEditParam(vm.featureAttr, vm.editParam, vm.currentFeature);
            // console.log("vm.editParam = ", vm.editParam);
            $sessionStorage.setObject("editParam", vm.editParam);
          }
        } else {
          handleEditParam(vm.featureAttr, vm.editParam, vm.currentFeature);
          // console.log("vm.editParam = ", vm.editParam);
          $sessionStorage.setObject("editParam", vm.editParam);
        }
      }

      toggleSaveButton();
    }

    /**
     * Handles Edit + Edit operations on Right Save click
     * 
     * @param {any} featureAttr feature's attributes which are displayed in right sidenav
     * @param {any} editParamCollection Edit collection  
     * @param {any} currentFeature 
     * 
     */
    function handleEditParam(featureAttr, editParamCollection, currentFeature) {
      // check is current feature already exist in editParamCollection due to geom edit
      if(editParamCollection.data.length > 0) {
        // find editted feature in editParam 
        var foundObjectInEditParam = lodash.find(editParamCollection.data, function(eachFeature){
          return (parseInt(featureAttr.type_crm) === eachFeature.type_crm || 
            featureAttr.type_crm === eachFeature.type_crm) 
        });
        // if found than replace it in ediParam else its a new feature push to editParam
        if(typeof foundObjectInEditParam !== "undefined") {
          searchAndReplace(featureAttr, editParamCollection);
        } else {
          var tempFeature = {
            "layer_id": vm.currentLayer.layerId,
            "type_crm": parseInt(featureAttr.type_crm),
            "key_cidoc_array": Object.keys(featureAttr),
            "value_gazetteer_array": Object.values(featureAttr)
          }
          editParamCollection.data.push(tempFeature);
          currentFeature.properties.key_cidoc_array = Object.keys(featureAttr).toString();
          currentFeature.properties.value_gazetteer_array = Object.values(featureAttr).toString();  
        }
      } else {
        var tempFeatureAttr = FeatureService.tearObject(featureAttr);
        var tempFeature = {
          "layer_id": vm.currentLayer.layerId,
          "type_crm": parseInt(featureAttr.type_crm),
          "key_cidoc_array": tempFeatureAttr.keys,
          "value_gazetteer_array": tempFeatureAttr.values
        }
        editParamCollection.data.push(tempFeature);
        currentFeature.properties.key_cidoc_array = Object.keys(featureAttr).toString();
        currentFeature.properties.value_gazetteer_array = Object.values(featureAttr).toString();
      }
    }

    /**
     * Since our API requires the data in a particular format. This funcion converts key: value 
     * combination to all keys together and all values together. Also adds geometry to 
     * that key and value style object
     * 
     * @param {any} attributes feature's attributes which are displayed in right sidenav
     * @param {any} feature 
     * 
     */
    function convertJsonToApiReqObj(attributes, feature) {
      // console.log(">>> convertJsonToApiReqObj >>> ", attributes, feature);
      for(var eachAttr in attributes) {
        if(Array.isArray(attributes[eachAttr])) {
          // eachAttr = eachAttr.toString();
          attributes[eachAttr] = JSON.stringify(attributes[eachAttr]);
          // console.log("attributes[eachAttr] = ", attributes[eachAttr]);
        }
      }
      var keys = Object.keys(attributes);
      var values = Object.values(attributes);
      
      // console.log(">>> convertJsonToApiReqObj >>> ", values);
      keys.push("geom");
      values.push(feature.geometry);
      return {
        "keys": keys,
        "values": values
      }
    }

    /**
     * Search for the feature in collection using 'type_crm' in feature to match with 'type_crm' 
     * in collection. Handles Edit + Edit operation
     * 
     * @param {any} feature 
     * @param {collection} collection
     * 
     * @returns collection modified collection
     */
    function searchAndReplace(feature, collection) {
      var returnData = [];
      var tempCollection = collection.data;
      lodash.forEach(tempCollection, function(eachFeature) {
        if(parseInt(feature.type_crm) === eachFeature.type_crm || 
            feature.type_crm === eachFeature.type_crm) {
          feature = FeatureService.tearObject(feature);
          eachFeature.key_cidoc_array = feature.keys;
          eachFeature.value_gazetteer_array = feature.values;
        } 
      });
      return returnData;
    }

    /**
     * Search for the feature in collection using 'type_crm' in feature to match with 'type_crm' 
     * in collection. Handles Edit + Edit operation
     * 
     * @param {any} feature 
     * @param {collection} collection
     * 
     * @returns collection modified collection
     */
    function searchFromCollectionToFeature(feature, collection) {
      var returnData = null;
      var tempCollection = collection.data;
      lodash.forEach(tempCollection, function(eachFeature){
        if(feature.type_crm === eachFeature.type_crm) {
          eachFeature = FeatureService.stitchObject(eachFeature.key_cidoc_array, eachFeature.value_gazetteer_array);
          returnData = eachFeature;
        }
      });
      // console.log("searchFromCollectionToFeature >>> returnData = ", returnData);
      return returnData;
    }

    /**
     * Search for the feature in collection using 'type_crm' in feature to match with 'type_crm' 
     * in collection. and replace the Feature's geometry in Collection  with feature' geometry
     * Basically used in Add/Edit + Edit (geom) operation
     * 
     * @param {any} feature 
     * @param {collection} collection
     * 
     * @returns collection modified collection
     */
    function searchAndReplaceOnlyGeom(feature, collection) {
      var tempCollection = collection.data;
      lodash.forEach(tempCollection, function(eachFeature){
        if(parseInt(feature.properties.type_crm) === eachFeature.type_crm || 
            feature.properties.type_crm === eachFeature.type_crm) {
              eachFeature.value_gazetteer_array[eachFeature.key_cidoc_array.indexOf("geom")] = feature.geometry;
        }
      });
    }

    /**
     * Searches for a feature in a collection given. Returns true if found else false
     * 
     * @param {any} feature 
     * @param {collection} collection
     * 
     * @returns boolean
     */
    function searchInCollection(collection, layer) {
      // console.log("searchInCollection >>> ", collection, layer);
      var tempReturn = lodash.find(collection.data, function(eachFeature){
        return (parseInt(layer.feature.properties.type_crm) === eachFeature.type_crm || 
        layer.feature.properties.type_crm === eachFeature.type_crm) 
      });
      if(typeof tempReturn !== "undefined") {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Deletes a feature from a collection given. Returns new collection
     * 
     * @param {any} feature 
     * @param {collection} collection
     * 
     * @returns collection
     */
    function deleteFeatureFromCollection(layer, collection) {
      return lodash.remove(collection.data, function(eachFeature){
        return (parseInt(layer.feature.properties.type_crm) === eachFeature.type_crm || 
        layer.feature.properties.type_crm === eachFeature.type_crm) 
      });
    }

    /**
     * Disables the Save button from accidental updates
     * Enables back when feature is clicked on map
     * 
     */
    function toggleSaveButton() {
      vm.disableSave = true;
    }

    /**
     * Calls the API for getting all versions of a particular feature
     * uses vm.currentFeature, vm.currentLayer
     * 
     */
    function showAllFeatureVersions() {
      // console.log(">>> >>> showAllFeatureVersions >>> ", vm.currentFeature, vm.currentLayer);
      MapLayerService.removeAllMapLayers('rightMapViewer');
      // call getAllFeatureVersion
      var reqParamData = { 
        proj_id: $sessionStorage.getObject("projId").toString(),
        layer_id: vm.currentLayer.layerId,
        type_crm: vm.currentFeature.properties.type_crm,
        fetch: 'allVersions'
      };
      var layerService = new VectorService();
      layerService.getAllFeatureVersion(reqParamData)
          .then(function(res){
            if(res.length > 0) {
              showFeatureOnMap(res);
            }
          }, function(err){
            console.log(err);
          });
    }

    /**
     * Shows / renders all versions of a particular feature on right map
     * Associates click event to each feature to show attributes on click
     * 
     * @param [{any}] features
     */
    function showFeatureOnMap(features) {

      if(angular.isDefined(vm.rightMapLayerGroup)) {
        vm.rightMapLayerGroup.clearLayers();
      }
      vm.rightMapLayerGroup = new leaflet.LayerGroup();
      
      leafletData.getMap('rightMapViewer').then(function (map) {
        lodash.forEach(features, function(feature) {
          feature.type_crm = vm.currentFeature.properties.type_crm + "_" + Math.floor(Math.random() * (9999 - 1 + 1)) + 1;
          var fgeom = JSON.parse(feature.geom);
          delete feature.geom;

          var geojsonFeature = {
            "type": "Feature",
            "properties": feature,
            "geometry": fgeom
          };
          // console.log("geojsonFeature = ", geojsonFeature);
          // vm.rightMapLayerGroup = leaflet.geoJSON(geojsonFeature, {
          //   onEachFeature: onEachFeature
          // }).addTo(map);
          leaflet.geoJSON(geojsonFeature, {
            onEachFeature: onEachFeature
          }).addTo(vm.rightMapLayerGroup);
        });
        vm.rightMapLayerGroup.addTo(map);
      });

      // inner fucntion used for binding click event to each feature
      function onEachFeature(feature, layer) {
        layer.on({
          'click': function (e) {
            close();
            showAttributes(feature.properties);
            vm.disableSave = true;
            vm.showAllVersions = false;
            open();
          }
        });
      }
    }

    /**
     * Open/close the right side nav
     * 
     */
    function toggleRight() {
      $mdSidenav('right').toggle();
    }

    /**
     * Called when Feature Type Dropdown is changed. Gets attributes (only key)of the feature
     * to generate the Attribute form
     * 
     * @param {string} vm.featureAttr.feature dropdown selected value
     */
    function getFormAttribute() {
      // console.log("getFormAttribute ", vm.featureAttr.feature);
      // call API for vm.featureAttr.feature
      var featureType = vm.featureAttr.feature;
      if(featureType.indexOf(" ") !== -1) {
        featureType = featureType.replace(/\s/g, '');
      }
      var reqParamData = {type : featureType};
      var vectorService = new VectorService();
      vectorService.getFormData(reqParamData)
          .then(function(res){
            // console.log("response ", res);
            vm.formParams = res;
          }, function(err){
            console.log(err);
          });
    }

    /**
     * Checks whether a field is dependent on other fields. Used for Dynamic form 
     * 
     * @param {string} field
     */
    function checkDependentValue(field) {
      // vm.formParams
      // featureAttr[field.name]
      if(vm.featureAttr !== null) {
        // console.log(field.name, " - ", field.dependent); 
        if(field.name !== field.dependent) {
          if(angular.isDefined(vm.featureAttr[field.dependent])) {
            // if(vm.featureAttr[field.dependent] !== "") {
            if(vm.featureAttr[field.dependent].length !== 0) {
              // console.log(">>> >>> checkDependentValue ", field, field.dependent, vm.featureAttr[field.dependent]);
              // field.required = true;
              // close();
              // open();
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    }

    /**
     * Converts comma sperated values to semi-colon seperated values
     * 
     * @param {*} csvString 
     */
    function convertToSSV(csvString) {
      // console.log("csvString = ", csvString);
      var resultString = "";
      for(var i=0; i < csvString.length; i++) {
        if(typeof csvString[i] !== "object" && typeof csvString[i] !== "string") {
          if(csvString[i].indexOf("[") !== -1) {
            if(resultString == "") {
              resultString = csvString[i];
            } else {
              resultString = resultString + ";"  + csvString[i];
            }
          } 
        } else {
          if(resultString == "") {
            resultString = csvString[i];
          } else {
            resultString = resultString + ";"  + csvString[i];
          }
        }
      }
      // return csvString.replace(/,/g, ";");
      return resultString;
    }

    /**
     * Checks the user based on his role whether he/she is allowed access on the feature 
     * 
     * @param {object} feature
     * @param {object} user currently logged in user
     */
    function checkUserAccessOnFeature(feature, user) {
      // console.log(">>> checkUserAccessOnFeature >>> ", feature, user);
      // admin
      if($sessionStorage.getObject("role").toString() === "1") {
        return true;
      }
      // senior user
      if($sessionStorage.getObject("role").toString() === "2") {
        return true;
      }
      // user
      if($sessionStorage.getObject("role").toString() === "3") {
        if(feature.properties.user_id === user) {
          return true;
        } else {
          return false;
        }
      } 
      // guest user
      if($sessionStorage.getObject("role").toString() === "4") {
        return false;
      }
    }

    activate();
    
  }

})();