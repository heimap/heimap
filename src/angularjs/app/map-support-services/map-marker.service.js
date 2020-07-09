(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapMarkerService', MapMarkerService);


  function MapMarkerService(lodash, leaflet) {
    var service = {
      buildMarker: buildMarker
    };   

    /**
     * Builds a marker object
     * 
     * @param {object} defaultOptions 
     * @param {object} markerOptions
     * @returns {object} marker
     */
    function buildMarker(markersHolder, markerOptions) {
      var defaultOptions = {
        focus: true,
        draggable: true
      }

      angular.merge(defaultOptions, markerOptions);
      var mKey = getNextMarkerKey(markersHolder);
      var mId = 'm' + mKey;
      var classes = 'mk-div-icon ' + mId;

      // build the icon object to be used in the marker
      var mIcon = {
        type: 'div',
        className: classes,
        iconSize: null,
        html: '<div class="mk-icon-container mk-ok">' + mKey + '</div>' // mk-ok, mk-warn or mk-error
      }

      // return the marker object with its properties/values
      return {
        id: mId,
        lat: defaultOptions.lat,
        lng: defaultOptions.lng,
        focus: defaultOptions.focus,
        message: defaultOptions.message,
        draggable: defaultOptions.draggable,
        icon: mIcon
      }

    }

    /**
     * Get the next auto increment id that must be used for a new marker
     * 
     * @param {any} markersHolder 
     * @returns nextIndex
     */
    function getNextMarkerKey(markersHolder) {
      var max = 0;
      lodash.forOwn(markersHolder, function (value, key) {
        var keyIndex = parseInt(key.replace('m', ''));
        if (keyIndex > max) {
          max = keyIndex;
        }
      });

      return (max + 1).toString();
    }


    return service;
  }
})();