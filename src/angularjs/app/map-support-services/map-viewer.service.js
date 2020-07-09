/**
 * Map Layer Service responsible for storing and returning global viewer option used by multiple controllers.
 * 
 * As a centralized service this service change the option value when asked for and broadcast an event when
 * this change occurs. The following event is broadcasted:
 * 
 * viewerOptionChanged

 */
(function () {
  'use strict';

  angular
    .module('app')
    .service('MapViewerService', MapViewerService);


  function MapViewerService($rootScope) {
    var service = {
      setOption: setOption,
      getOption: getOption
    };

    /**
     * Private property that stores the viewer global options 
     *  
     */
    var serviceData = {};

   
    /**
     * Define an option for a viewer with a given value
     * 
     * @param {any} viewerId 
     * @param {any} option 
     * @param {any} value 
     */
    function setOption(viewerId, option, value) { 
      parseViewer(viewerId, option);   
      serviceData[viewerId][option] = value;
      var changed = { viewerId: viewerId, option: viewerId, value: value }
      $rootScope.$broadcast('viewerOptionChanged', changed);
    }

    /**
     * Get an global option value, or, if it is not defined, the default value
     * 
     * @param {any} viewerId 
     * @param {any} option 
     * @param {any} defaultValue 
     * @returns 
     */
    function getOption(viewerId, option, defaultValue) {
      parseViewer(viewerId, option);        
      if(angular.isUndefined(serviceData[viewerId][option])) {
        return defaultValue;
      } 
      return serviceData[viewerId][option];
    }

    /**
     * Ensures that the viewer property exists
     * 
     * @param {any} viewerId 
     */
    function parseViewer(viewerId){
      if(angular.isUndefined(serviceData[viewerId])) {
        serviceData[viewerId] = {}
      }     
    }
    return service;
  }
})();