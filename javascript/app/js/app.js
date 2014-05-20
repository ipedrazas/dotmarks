'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap'])
.config(function ($routeProvider) {
	  $routeProvider
		  .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
		  .when('/terminal', {templateUrl: 'partials/terminal.html', controller: 'terminalCtl'})
          .when('/signin', {templateUrl: 'partials/signin.html', controller: 'authCtl'})
          .when('/signup', {templateUrl: 'partials/signup.html', controller: 'authCtl'})
		  .otherwise({redirectTo: '/home'});
});

