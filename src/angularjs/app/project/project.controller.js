(function() {

  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  /** @ngInject */
  // eslint-disable-next-line max-params
  function ProjectController($location, Global) {
    var vm = this;

    //Attributes Block

    //Functions Block

    // console.log($location.search());
    var qParams = $location.search();
    sessionStorage.clear();
    // sessionStorage.setItem("role", "admin");
    if(qParams.role === "admin") {
        sessionStorage.setItem("role", "1");
    } else if(qParams.role === "senior") {
        sessionStorage.setItem("role", "2");
    } else if(qParams.role === "user") {
        sessionStorage.setItem("role", "3");
    } else if(qParams.role === "guest") {
        sessionStorage.setItem("role", "4");
    }
    
    // console.log("appcontroller ", $localStorage);
    sessionStorage.setItem("projId", qParams.projId);
    sessionStorage.setItem("userId", qParams.userId);
    $location.url(Global.clientPath);
  }

})();
