(function () {

  'use strict';

  angular
    .module('app')
    .filter('yesOrNo', yesOrNo);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function yesOrNo($filter) {
    /**
     * Filter to convert boolean to yes or not string
     *
     * @param {any} input property/variable
     * @returns the translated yes/no string
     */
    return function (input) {      
      var isTrue = (input === true || input === 'true' || input === 1 || (angular.isDefined(input) && input !== false));
      var key = 'global.' + (isTrue? 'yes': 'no');
      var translated =  $filter('translate')(key);
      return translated;
    }
  }

})();