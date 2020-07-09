(function () {

    'use strict';

    angular
        .module('app')
        .controller('AppController', AppController);

    /** @ngInject */
    /**
     * Controller responsible for functionalities that are used in any system state/page
     */
    function AppController($state, Global, $localStorage) {
        var vm = this;

        // Current year to be shown in the footer
        vm.currentYear = null;
        activate();

        function activate() {
            var date = new Date();
            vm.currentYear = date.getFullYear();
        }

        // sessionStorage.clear(); 
        // sessionStorage.setItem("role", "admin");
        // if(sessionStorage.getItem("role") === "admin") {
        //     sessionStorage.setItem("role", "1");
        // } else if(sessionStorage.getItem("role") === "senior") {
        //     sessionStorage.setItem("role", "2");
        // } else if(sessionStorage.getItem("role") === "user") {
        //     sessionStorage.setItem("role", "3");
        // } else if(sessionStorage.getItem("role") === "guest") {
        //     sessionStorage.setItem("role", "4");
        // }
        
        // console.log("appcontroller ", $localStorage);
        // sessionStorage.setItem("projId", "31024283");
        // sessionStorage.setItem("userId", "1000");
    }

})();