/*eslint-env es6*/

(function () {

  'use strict';

  angular
    .module('app')
    .controller('MenuController', MenuController);

  /** @ngInject */
  function MenuController($mdSidenav, $state, $mdColors, $rootScope, $window, Global) {
    var vm = this;

    //Bloco de declaracoes de funcoes
    vm.open = open;
    vm.openMenuOrRedirectToState = openMenuOrRedirectToState;
    vm.redirectToDiscussion = redirectToDiscussion;
    vm.redirectToDashboard = redirectToDashboard;
    
    // added to make the menu highlighted
    vm.currentNavItem = $state.current.name;
    // root state change watcher to highlight the tab on each state change
    $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams){ 
        // console.log("state changed from - ", fromState, " to - ", toState);
          vm.currentNavItem = toState.name;
    })
    activate();

    function activate() {
      // Array contendo os itens que são mostrados no menu lateral
      vm.itensMenu = [];     
    }

    function open() {      
    }

    /**
     * Método que exibe o sub menu dos itens do menu lateral caso tenha sub itens
     * caso contrário redireciona para o state passado como parâmetro
     */
    function openMenuOrRedirectToState($mdMenu, ev, item) {
      if (angular.isDefined(item.subItens) && item.subItens.length > 0) {
        $mdMenu.open(ev);
      } else {
        $state.go(item.state);
        $mdSidenav('left').close();
      }
    }

    function getColor(colorPalettes) {
      return $mdColors.getThemeColor(colorPalettes);
    }

    function redirectToDashboard() {
      console.log('>>> redirectToDashboard');
      $window.location = Global.dashboardUrl;
    }

    function redirectToDiscussion() {
      // old - http://129.206.5.209:8080/group/{{project id }}/content/create/group_node%3Adiscussion
      // https://heimap-app.uni-heidelberg.de/group/1/discussions 
      $window.location = Global.dashboardUrl 
        + '/group/' 
        + sessionStorage.getItem("projId") 
        + '/discussions';
    }
  }

})();
