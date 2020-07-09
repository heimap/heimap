(function() {

  'use strict';

  angular
    .module('app')
    .controller('ImportController', ImportController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function ImportController($controller, ImportService) {
    var vm = this;

    //Attributes Block

    //Functions Block

    // instantiate base controller
    $controller('CRUDController', { vm: vm, modelService: ImportService, options: { searchOnInit:false } });

  }

})();
