(function () {
	'use strict';
	var app = angular.module('app');

	app.factory('$sessionStorage', ['$window', function($window) {
		return {
			set: function(key, value) {
				$window.sessionStorage[key] = value;
			},
			get: function(key, defaultValue) {
				return $window.sessionStorage[key] || defaultValue;
			},
			setObject: function(key, value) {
				$window.sessionStorage[key] = JSON.stringify(value);
			},
			getObject: function(key) {
				return JSON.parse($window.sessionStorage[key] || '{}');
			},
			remove: function(key){
				delete $window.sessionStorage[key];
			}
		}
	}]);

})();