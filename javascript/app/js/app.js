'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap'])
.config(function ($routeProvider) {
	  $routeProvider
		  .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
		  .when('/wn', {templateUrl: 'partials/entries.html', controller: 'wnController'})
		  .otherwise({redirectTo: '/home'});
});

angular.module('dotApp').config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.patch = {
	    'Content-Type': 'application/json;charset=utf-8'
	}
}]);