(function () {
    'use strict';
  
    angular
      .module('app')
      .config(config);
  
    /** @ngInject */
    // eslint-disable-next-line max-params
    function config(Global, $mdThemingProvider, $modelFactoryProvider,
      $translateProvider, moment, $mdAriaProvider, $windowProvider) {
  
      $translateProvider
        .useLoader('languageLoader')
        .useSanitizeValueStrategy('escape');
  
      //$translateProvider.usePostCompiling(true);
  
      moment.locale('en-GB');
  
      //the prefix to be used in all back-end api requests
      var $window = $windowProvider.$get();
      $modelFactoryProvider.defaultOptions.prefix = Global.apiPath;
  
      // Configuration theme - see: https://material.angularjs.org/latest/Theming/03_configuring_a_theme
      $mdThemingProvider.theme('default')
        .primaryPalette('blue', {
          default: '700'
        })
        .accentPalette('indigo')
        .warnPalette('deep-orange');
  
      // Enable browser color
      $mdThemingProvider.enableBrowserColor();     
  
      $mdAriaProvider.disableWarnings();
  
    }
  }());
  