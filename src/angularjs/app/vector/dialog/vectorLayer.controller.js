(function () {

  'use strict';

  angular
      .module('app')
      .controller('VectorLayerController', VectorLayerController);

  function VectorLayerController($state, VectorService, lodash, C2Dialog, C2Toast, $translate, mapDialogInput) {

    var vm = this;
    vm.save = save;
    vm.close = close;
    vm.mode = null;

    vm.viewTitle = "Add Layer";
    vm.resource = {
      title: null,
      description: null,
      // layerName: "vertex_proj_id_projectId1_layer_id_layerId_latest",
      proj_id: null,
      user_id: null,
      layerName: null,
      layerId: null
    }
    
    function init() {
      // console.log(">>> VectorLayerController >>> init ");
      defineViewState();
      if(angular.isDefined(mapDialogInput.model)) {
        vm.resource.title = mapDialogInput.model.title;
        vm.resource.description = mapDialogInput.model.desc;
        vm.resource.layerName = mapDialogInput.model.layerName;
        vm.resource.layerId = mapDialogInput.model.layerId;
        // console.log("init ...... ", vm.resource);
      }
    }

    function save() {
      // console.log(">>> VectorLayerController >>> save ", vm.resource);
      var vectorService = new VectorService();
      if(angular.equals(vm.mode, "add")) {
        if(! lodash.isEmpty(sessionStorage.getItem("projId"))) {
          vm.resource.proj_id = sessionStorage.getItem("projId");
          vm.resource.user_id = sessionStorage.getItem("userId");
        }
        var reqParam = {
          "action": "createLayers",
          "data": []
        };
        reqParam.data.push(vm.resource);
        vectorService.createVectorLayers(reqParam)
          .then(function(response){
            // console.log("response ", response);
            if(response === "success") {
              C2Toast.success($translate.instant('messages.saveSuccess'));  
              close();
              // $state.reload();
              location.reload();
            } else {
              C2Toast.error($translate.instant('messages.saveError'));
            }
          }, function(err){
            console.log(err)
          });
      } 
      else if(angular.equals(vm.mode, "edit")) {
        if(! lodash.isEmpty(sessionStorage.getItem("projId"))) {
          vm.resource.proj_id = sessionStorage.getItem("projId");
          vm.resource.user_id = sessionStorage.getItem("userId");
        }
        // console.log("edit saving...... ", vm.resource);
        var reqParam = {
          "action": "editLayers",
          "data": [{
            "title": vm.resource.title,
            "description": vm.resource.description,
            "layer_id": vm.resource.layerId,
            "user_id": vm.resource.user_id,
            "proj_id": vm.resource.proj_id
            }]
        };
        // reqParam.data.push(vm.resource);
        vectorService.editVectorLayers(reqParam)
          .then(function(response){
            // console.log("response ", response);
            if(response === "success") {
              C2Toast.success($translate.instant('messages.saveSuccess'));  
              close();
              $state.reload();
            } else {
              C2Toast.error($translate.instant('messages.saveError'));
            }
          }, function(err){
            console.log(err)
          });
      }
    }

    /**
     * Define the dialog view state as add or edit 
     * and parse the view title
     * 
     * @return void
     */
    function defineViewState(){
      vm.mode = angular.isDefined(mapDialogInput.model)? 'edit' : 'add';
      if (vm.mode == 'add') {
          vm.viewTitle = $translate.instant('views.titles.addLayer');
      } else {
          vm.viewTitle = $translate.instant('views.titles.editLayer');
      }
    }

    /**
     * Close the dialog
     * 
     */
    function close() {
      C2Dialog.close();
    }

    init();
  }

})();