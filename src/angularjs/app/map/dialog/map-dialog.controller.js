(function () {

    'use strict';

    angular
        .module('app')
        .controller('MapDialogController', MapDialogController);

    /** @ngInject */
    // eslint-disable-next-line max-params
    function MapDialogController($controller, MapService, C2Dialog, mapDialogInput, FileService, C2Toast, $translate, MapTypeService, MapProjectionService, MapProjectService, lodash, MapLayerService) {

        var vm = this;

        vm.onActivate = onActivate;
        vm.beforeSave = beforeSave;
        vm.afterSave = afterSave;        
        vm.onFileRemove = onFileRemove;
        vm.removeFile = removeFile;       
        vm.onActivate = onActivate;
        vm.close = close;
        vm.geoFileNeeded = false;
        vm.onImageFileChange = onImageFileChange;
        vm.onGeoFileChange = onGeoFileChange;
        vm.showGeoFileInput = showGeoFileInput;
        vm.showProjectionInput = showProjectionInput;   
        vm.showGeorefBadge = showGeorefBadge;

        // instantiate base controller
        $controller('CRUDController', {
            vm: vm,
            modelService: MapService,
            options: {
                searchOnInit: false
            }
        });

        /**
         * Run initial functions on dialog openIng
         * @return void
         */
        function onActivate() {
            vm.saving = false;
            defineViewState();
            vm.removeMap = mapDialogInput.removeFn;
            MapTypeService.paginate().then(
                function(response) {
                    vm.mapTypes = response.items;
                    adjustResource();              
                }
            );  
           MapProjectionService.paginate().then(
                function(response) {
                    vm.projections = response.items;
                }
            );

            MapProjectService.paginate().then(
                function (response) {
                  vm.projects = response.items;
                }
            ); 
        }

        /**
         * Check if a valid projection is selected and thus if we shall show the geo file input
         * 
         * @returns boolean
         */
        function showGeoFileInput(){
            return angular.isDefined(vm.resource.projection) && vm.resource.projection != null;
        }

        /**
         * Define the dialog view state as add or edit 
         * and parse the view title
         * @return void
         */
        function defineViewState(){
            vm.mode = angular.isDefined(mapDialogInput.model)? 'edit' : 'add';
            if (vm.mode == 'add') {
                vm.viewTitle = $translate.instant('views.titles.addMap');
            } else {
                vm.viewTitle = $translate.instant('views.titles.editMap');
            }
        }

        function showProjectionInput() {
            var result = vm.geoFileNeeded && vm.mode === 'add';
            return result;           
        }

        /**
         * Adjust resource mapping the field names and set the resource model
         * @return void
         */
        function adjustResource(){
            if (vm.mode === 'edit') {
                vm.resource = mapDialogInput.model;                
                var mapType = lodash.find(vm.mapTypes, function(m) { 
                    return m.id === vm.resource.field_map_type 
                });
                vm.resource.mapType = mapType;
                vm.geoFileNeeded = !vm.resource.mapImageFile.georeferenced;           
            }  
        }

        /**
         * Close the dialog
         * 
         */
        function close() {
            C2Dialog.close();
        }

        /**
         * Handle the after save event, refreshing the maps from server and closing the dialog
         * 
         */
        function afterSave(){
            vm.saving = false;
            if(angular.isDefined(mapDialogInput.onSave)){
                mapDialogInput.onSave();
            }
            close();
            MapLayerService.refreshMapResource(vm.resourceUpdated); 

        }

        /**
         * Check the constraints and adjust resource mapping the field names and set the resource model
         * 
         * @returns void
         */
        function beforeSave() {
            vm.saving = true;
            if (angular.isUndefined(vm.resource.mapImageFile)) {
                vm.saving = false;
                C2Toast.error($translate.instant('messages.mapFileIsMandatory'));
                return false;
            } else {
                vm.resource.image_file_id = vm.resource.mapImageFile.id;
                vm.resource.map_type_id = vm.resource.mapType.id;
                
                if (angular.isDefined(vm.resource.mapGeoFile)) {
                    vm.resource.field_map_geo_id = vm.resource.mapGeoFile.id;                    
                }                             
            } 
            // While we don't have projects management, assign the first
            vm.resource.map_project_id = vm.projects[0].id;
            vm.resourceUpdated = angular.copy(vm.resource);           
        }        

        /**
         * Handles the file remove event, deleting the file from the back-end 
         * and removing it from the resource.files collection  
         * @param {any} fileData 
         */
        function onFileRemove() {
            //vm.removeMap();
        }

        /**
         * Handles the file remove event, deleting the file from the back-end 
         * and removing it from the resource.files collection
         */
        function removeFile(file) {            
            var fileService = new FileService();
            fileService.id = file.id;
            
            if (angular.isDefined(fileService)) {
                fileService.$destroy().then(
                    function () {
                        setStateAfterFileRemoval(file);
                    }
                );
            }
        }

        /**
         * Set the the variables state after a file (image or geo) is removed
         * 
         * @param {object} savedFileData 
         */
        function setStateAfterFileRemoval(removedFile){
            setIsGeoreferenced();
            var isImage = angular.isDefined(removedFile.thumb)? true : false;
            if(isImage){
                vm.resource.mapImageFile = {};
                vm.resource.mapGeoFile = {};
                vm.geoFileNeeded = false;
            } else {
                vm.resource.mapGeoFile = {};
                vm.geoFileNeeded = !vm.resource.georeferenced;
            }
            
        }

        /**
         * Handles the image file change (when a file is added), preparing, and uploading it 
         * to the back-end and adding it to the client resource.files collection 
         */
        function onImageFileChange(){            
            // In sequence we upload the new file (we dont have to wait the removal)
            var fileObj = vm.imageFile[0];
            if (angular.isDefined(fileObj) && !fileObj.isRemote) {
                if(fileObj.lfTagType === "image") {
                    // check whether the file size is less than 200 MB
                    if(fileObj.lfFile.size/1024/1024 <= 200) {
                        var fileService = new FileService();
                        fileService.file = fileObj.lfFile;                
                        uploadFile(fileService);                
                    } else {
                        C2Toast.error($translate.instant('messages.fileTooBig'));
                    }
                } else {
                    C2Toast.error($translate.instant('messages.invalidImageFile'));
                }
            }
        }

        /**
         * Handles the geo file change (when a file is added), preparing, and uploading it 
         * to the back-end and adding it to the client resource.files collection 
         */
        function onGeoFileChange(){
            // We the has a image, we ask the server to remvoe this file
            // to avoid garbage in the back-end
            var imageId = null;
            if(angular.isDefined(vm.resource.mapImageFile) && angular.isDefined(vm.resource.mapImageFile.id)) {
                imageId = vm.resource.mapImageFile.id;                
            }
            // In sequence we upload the new file (we dont have to wait the removal)
            var fileObj = vm.geoFile[0];
            if (angular.isDefined(fileObj) && !fileObj.isRemote) {
                var fileService = new FileService();
                fileService.file = fileObj.lfFile;
                fileService.map_image_file_id = imageId;
                fileService.map_geo_file_projection = vm.resource.projection.value;
                uploadFile(fileService);                
            };
        }        
        
        /**
         * Process a file upload (image or geo file)
         * 
         * @param {FileService} fileService 
         */
        function uploadFile(fileService){
            fileService.upload().then(
                function (savedFileData) {
                    setStateAfterFileUpload(savedFileData);
                }
            );
        }

        /**
         * Set the the variables state after a file (image or geo) is uploaded
         * 
         * @param {object} savedFileData 
         */
        function setStateAfterFileUpload(savedFileData){            
            if (angular.isDefined(savedFileData.id)) {
                if (angular.isDefined(savedFileData.thumb)) {
                    vm.resource.mapImageFile = savedFileData;
                    // if(!vm.resource.mapImageFile.georeferenced){
                    if(!vm.resource.mapImageFile.isgeoref){
                        vm.geoFileNeeded = true;                        
                    } 
                } else {
                    vm.resource.mapGeoFile = savedFileData;
                    vm.geoFileNeeded = false;
                }
                setIsGeoreferenced();                         
            }
        }

        /**
         * Define a shorthand property if the map is georeferenced or not
         * 
         */
        function setIsGeoreferenced(){
            // vm.resource.georeferenced = vm.resource.mapImageFile.georeferenced === true || angular.isDefined(vm.resource.mapGeoFile.id);
            vm.resource.georeferenced = vm.resource.mapImageFile.isgeoref;
        }

        function showGeorefBadge() {
            if(vm.resource.georeferenced !== undefined && vm.mode !== 'edit') {
                return true;
            } else {
                return false;
            }
        }
    }

})();