(function() {

  'use strict';

  angular
    .module('app')
    .factory('languageLoader', LanguageLoader);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function LanguageLoader($q, $log, $injector) {
    var service = this;

    service.translate = function(locale) {
      return {
        global: $injector.get(locale + '.i18n.global'),
        views: $injector.get(locale + '.i18n.views'),
        attributes: $injector.get(locale + '.i18n.attributes'),
        dialog: $injector.get(locale + '.i18n.dialog'),
        messages: $injector.get(locale + '.i18n.messages'),
        models: $injector.get(locale + '.i18n.models')
      };
    }

    // return loaderFn
    return function(options) {
      $log.info('Loading the language content ' + options.key);
      var translation = service.translate(options.key);
      return $q.when(translation);     
    }
  }

})();
