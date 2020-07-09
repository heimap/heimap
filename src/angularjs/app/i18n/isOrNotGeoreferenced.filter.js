(function () {

  'use strict';

  angular
    .module('app')
    .filter('isOrNotGeoreferenced', isOrNotGeoreferenced);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function isOrNotGeoreferenced($filter) {
    /**
     * Filter to convert boolean to yes or not string
     *
     * @param {any} input property/variable
     * @returns the translated yes/no string
     */
    return function (input) {      
      var isTrue = (input === true || input === 'true' || input === 1 || (angular.isDefined(input) && input !== false));
      var key = 'attributes.' + (isTrue? 'isGeoreferenced': 'isNotGeoreferenced');
      var translated =  $filter('translate')(key);
      return translated;
    }
  }

})();