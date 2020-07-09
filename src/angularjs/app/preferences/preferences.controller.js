(function() {

  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function PreferencesController($controller, PreferencesService) {
    var vm = this;

    //Attributes Block

    //Functions Block

    // instantiate base controller
    $controller('CRUDController', { vm: vm, modelService: PreferencesService, options: { searchOnInit:false } });

  }

})();
