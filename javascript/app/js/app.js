'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap', 'LocalStorageModule', 'angularFileUpload'])
.config(function ($routeProvider) {
	  $routeProvider
          .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/terminal', {templateUrl: 'partials/terminal.html', controller: 'terminalCtl'})
          .when('/signin', {templateUrl: 'partials/signin.html', controller: 'authCtl'})
          .when('/signup', {templateUrl: 'partials/signup.html', controller: 'authCtl'})
          .when('/home', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/edit', {templateUrl: 'partials/editDotMark.html', controller: 'dotMarkController'})
          .when('/applications', {templateUrl: 'partials/applications.html', controller: 'appsCtl'})
          .when('/settings', {templateUrl: 'partials/settings.html', controller: 'settingsCtl'})
		.otherwise({redirectTo: '/home'});
}).config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});;

