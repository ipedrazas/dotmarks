'use strict';


// Declare app level module which depends on filters, and services
angular.module('dotApp', ['ngRoute','ui.bootstrap', 'LocalStorageModule', 'angularFileUpload'])
.config(['$routeProvider', '$httpProvider' ,function ($routeProvider, $httpProvider) {
	  $routeProvider
          .when('/dotmarks', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/terminal', {templateUrl: 'partials/terminal.html', controller: 'terminalCtl'})
          .when('/signin', {templateUrl: 'partials/signin.html', controller: 'authCtl'})
          .when('/signup', {templateUrl: 'partials/signup.html', controller: 'authCtl'})
          .when('/reset', {templateUrl: 'partials/reset.html', controller: 'authCtl'})
          .when('/resetlink', {templateUrl: 'partials/reset.html', controller: 'authCtl'})
          .when('/home', {templateUrl: 'partials/dotmarks.html', controller: 'dotMarkController'})
          .when('/edit', {templateUrl: 'partials/editDotMark.html', controller: 'dotMarkController'})
          .when('/applications', {templateUrl: 'partials/applications.html', controller: 'appsCtl'})
          .when('/settings', {templateUrl: 'partials/settings.html', controller: 'settingsCtl'})
		.otherwise({redirectTo: '/home'});

     delete $httpProvider.defaults.headers.common['X-Requested-With'];

}]).config(function ($provide, $httpProvider) {

  // Intercept http calls.
  $provide.factory('MyHttpInterceptor', function ($q) {
    return {
      // On request success
      request: function (config) {
        // console.log(config); // Contains the data about the request before it is sent.

        // Return the config or wrap it in a promise if blank.
        return config || $q.when(config);
      },

      // On request failure
      requestError: function (rejection) {
        console.log(rejection); // Contains the data about the error on the request.

        // Return the promise rejection.
        return $q.reject(rejection);
      },

      // On response success
      response: function (response) {
        console.log(response); // Contains the data from the response.

        // Return the response or promise.
        return response || $q.when(response);
      },

      // On response failture
      responseError: function (rejection) {
        console.log(rejection); // Contains the data about the error.
        return $q.reject(rejection);
      }
    };
  });

  // Add the interceptor to the $httpProvider.
  $httpProvider.interceptors.push('MyHttpInterceptor');

});

