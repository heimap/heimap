(function () {

  'use strict';

  angular
    .module('app')
    .controller('CRUDController', CRUDController);

  /** @ngInject */
  /**
   * Base Controller that  implements al the standard CRUD functions
   *
   * Implemented actions:
   * activate()
   * search(page)
   * edit(resource)
   * save()
   * remove(resource)
   * goTo(viewName)
   * cleanForm()
   *
   * Triggers:
   *
   * onActivate()
   * applyFilters(defaultQueryFilters)
   * beforeSearch(page) //returning false cancel the submission/flow
   * afterSearch(response)
   * beforeClean //returning false cancel the submission/flow
   * afterClean()
   * beforeSave() //returning false cancel the submission/flow
   * afterSave(resource)
   * onSaveError(error)
   * beforeRemove(resource) //returning false cancel the submission/flow
   * afterRemove(resource)
   *
   * @param {any} vm child controller instance
   * @param {any} modelService model service that the controller will use for the restful requests
   * @param {any} options options to overwrite the default behaviors
   */
  // eslint-disable-next-line max-params
  function CRUDController(vm, modelService, options, C2Toast, C2Pagination, // NOSONAR
    C2Dialog, $translate) {

    //Functions Block
    vm.search = search;
    vm.paginateSearch = paginateSearch;
    vm.normalSearch = normalSearch;
    vm.edit = edit;
    vm.save = save;
    vm.remove = remove;
    vm.goTo = goTo;
    vm.cleanForm = cleanForm;

    activate();

    /**
     * Prepare the controller
     * Do an options merge
     * Initialize the resource
     * Initialize the paging object and do the initial search (if searchOnInit is true )
     */
    function activate() {
      vm.defaultOptions = {
        redirectAfterSave: true,
        searchOnInit: true,
        perPage: 8,
        skipPagination: false
      };

      angular.merge(vm.defaultOptions, options);

      vm.viewForm = false;
      vm.resource = new modelService(); 

      if (angular.isFunction(vm.onActivate)) vm.onActivate();

      var labelOptions = {
        labels: {
          total: $translate.instant('views.pagination.total'),
          items: $translate.instant('views.pagination.items')
        }
      };

      vm.paginator = C2Pagination.getInstance(vm.search, vm.defaultOptions.perPage, labelOptions);

      if (vm.defaultOptions.searchOnInit) vm.search();
    }


    /**
     * Do a search
     * Checks which of the search functions must be used
     *
     * @param {any} page page that must be requested
     */
    function search(page) {
      (vm.defaultOptions.skipPagination) ? normalSearch(): paginateSearch(page);
    }

    /**
     * Do a paged search with the applied filters
     *
     * @param {any} page page that must be requested
     */
    function paginateSearch(page) {
      vm.paginator.currentPage = (angular.isDefined(page)) ? page : 1;
      vm.defaultQueryFilters = {
        page: vm.paginator.currentPage,
        perPage: vm.paginator.perPage
      };

      if (angular.isFunction(vm.applyFilters)){
        vm.defaultQueryFilters = vm.applyFilters(vm.defaultQueryFilters);
      }
      if (angular.isFunction(vm.beforeSearch) && vm.beforeSearch(page) === false) return false;

      modelService.paginate(vm.defaultQueryFilters).then(function (response) {
        vm.paginator.calcNumberOfPages(response.total);
        vm.resources = response.items;

        if (angular.isFunction(vm.afterSearch)) vm.afterSearch(response);
      });
    }

    /**
     * Do a search with the applied filters
     *
     */
    function normalSearch() {
      vm.defaultQueryFilters = {};

      if (angular.isFunction(vm.applyFilters)) vm.defaultQueryFilters = vm.applyFilters(vm.defaultQueryFilters);
      if (angular.isFunction(vm.beforeSearch) && vm.beforeSearch() === false) return false;

      modelService.query(vm.defaultQueryFilters).then(function (response) {
        vm.resources = response;

        if (angular.isFunction(vm.afterSearch)) vm.afterSearch(response);
      });
    }

    /**
     * Clear the form
     */
    function cleanForm(form) {
      if (angular.isFunction(vm.beforeClean) && vm.beforeClean() === false) return false;

      vm.resource = new modelService();

      if (angular.isDefined(form)) {
        form.$setPristine();
        form.$setUntouched();
      }

      if (angular.isFunction(vm.afterClean)) vm.afterClean();
    }

    /**
     * Load the selected resource in the form
     *
     * @param {any} resource selected resource
     */
    function edit(resource) {
      vm.goTo('form');
      vm.resource = new angular.copy(resource);

      if (angular.isFunction(vm.afterEdit)) vm.afterEdit();
    }

    /**
     * Save or update the resource
     * In the default behavior, redirect the user to the list view after saving
     *
     * @returns
     */
    function save(form) {
      if (angular.isFunction(vm.beforeSave) && vm.beforeSave() === false) return false;

      // console.log(vm.resource)

      vm.resource.$save().then(function (resource) {
        //vm.resource = resource;

        if (angular.isFunction(vm.afterSave)) vm.afterSave(resource);

        if (vm.defaultOptions.redirectAfterSave) {
          vm.cleanForm(form);
          vm.search(vm.paginator.currentPage);
          vm.goTo('list');
        }

        C2Toast.success($translate.instant('messages.saveSuccess'));

      }, function (responseData) {
        if (angular.isFunction(vm.onSaveError)) vm.onSaveError(responseData);
      });
    }

    // /**
    //  * Save vector GeoJSON data
    //  * 
    //  * @returns
    //  */
    // function savegeojson(data){
    //   data = "{adssd}"
    //   vm.resource.geosjondata = data
    //   console.log(vm.resource)
    //   // vm.resource.$save().then(function (resource) {
    //   //   // vm.resource = resource;

    //   //   // console.log("resource")

    //   // }, function (responseData) {
    //   //   // console.log("responseData");
    //   // });
    // }

    /**
     * Retrieve vector GeoJSON data
     * 
     * @returns
     */
    function retrievegeojson(params){
      console.log(params)
    }

    /**
     * Remove the resource, but before show a dialog to confirm     
     *
     * @param {any} resource resource selected
     */
    function remove(resource) {
      var config = {
        title: $translate.instant('dialog.confirmTitle'),
        description: $translate.instant('dialog.confirmDescription'),
        yes: $translate.instant('global.yes'),
        no: $translate.instant('global.no')
      }

      C2Dialog.confirm(config).then(function () {
        if (angular.isFunction(vm.beforeRemove) && vm.beforeRemove(resource) === false) return false;

        resource.$destroy().then(function () {
          if (angular.isFunction(vm.afterRemove)) vm.afterRemove(resource);

          vm.search();
          C2Toast.info($translate.instant('messages.removeSuccess'));
        });
      });
    }

    /**
     * Switch between the list and form mode
     *
     * @param {any} viewName view name to witch to
     */
    function goTo(viewName) {
      vm.viewForm = false;

      if (viewName === 'form') {
        vm.cleanForm();
        vm.viewForm = true;
      }
    }
  }

})();