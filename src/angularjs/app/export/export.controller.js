(function() {

  'use strict';

  angular
    .module('app')
    .controller('ExportController', ExportController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function ExportController($controller, ExportService) {
    var vm = this;

    //Attributes Block

    //Functions Block

    // instantiate base controller
    $controller('CRUDController', { vm: vm, modelService: ExportService, options: { searchOnInit:false } });

  }

})();
