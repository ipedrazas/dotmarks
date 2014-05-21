'use strict';

function log(entry){
    if( console && console.log ) {
            console.log(entry);
    }
}

function reduce(arr) {
    var tags = [], a = [], b = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }

    for ( var i = 0; i < a.length; i++ ) {
        tags.push({label: a[i], count: b[i]});
    }
    return tags

}


Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + "/" + (mm[1]?mm:"0"+mm[0]) + "/" + (dd[1]?dd:"0"+dd[0]); // padding
  };



/* Controllers */

angular.module('dotApp').controller('terminalCtl', ['$scope', 'api', 'Base64', '$routeParams', function ($scope, api, Base64, $routeParams) {
    $scope.execute = function(){
      log($scope.terminal);
    };
    $scope.bulkImport = function(){
        var params = new Array();
        var data = $scope.terminal;
        var urls = data.split("\n");
        _.each(urls, function(el) {
          var o = {};
          o['username'] = 'ivan';
          o['url'] = el;
          params.push(o);
        });
        api.saveDotMark(JSON.stringify(params)).success(function(data){
            log(data);
            $scope.terminal = $scope.terminal + "\n\nResults:\n"
            _.each(data, function(element){
                log(element);
                if(element._status == 'OK'){
                    $scope.terminal = $scope.terminal + "[OK] - " + element._links.self.href + "\n";
                }
                if(element._status == 'ERR'){
                    $scope.terminal = $scope.terminal + "[FAILED] - " + element._issues.url + "\n";
                }
            });
        });

    };
}]);




angular.module('dotApp').controller('dotMarkController',
    ['$scope', 'api', 'appaudit', 'Base64', '$routeParams', function ($scope, api, appaudit, Base64, $routeParams) {

    $scope.user = false;

    var callbackHandler = function(data){
        var elems = new Array();
        var etags = new Array();
        var atags = new Array();
        _.each(data._items, function(item){
            elems.push(item);
            atags.push.apply(atags, item.atags);
            _.each(item.tags, function(tag) {
                etags.push(tag.toLowerCase());
            });
        });
        log(elems);
        $scope.dotmarks = elems;
        $scope.tags = reduce(etags);
        $scope.atags = reduce(atags);

    };

    $scope.refreshEntries = function(){
        api.getDotMarksEntries().success(callbackHandler);
    };

    $scope.getTags = function(){
        api.getDotMarksByTag($routeParams.tag).success(function (data) {
            var elems = new Array();
            // var etags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                // _.each(item.tags, function(tag) {
                //     etags.push(tag.toLowerCase());
                // });
             });
             $scope.dotmarks = elems;
             // $scope.tags = reduce(etags);
        });
    };

    $scope.searchDotMarks = function(query){
        api.searchDotMarks(query).success(function (data) {
            var elems = new Array();
             _.each(data._items, function(item){
                elems.push(item);
             });
             $scope.dotmarks = elems;
        });
    };

    $scope.starDotMark = function(id, star){
        log(id);
        _.each($scope.dotmarks, function(item) {
             if(id == item._id){
                item.star = star;
                appaudit.starDotMark(id, star);
             }
        });
    };

    if($routeParams.tag !== undefined){
        $scope.getTags();
    }else{
        $scope.refreshEntries();
    }


  }]);

angular.module('dotApp').controller('authCtl', ['$scope', '$rootScope','$location','appauth', function ($scope, $rootScope, $location, appauth){

  $scope.login = function (){
        var user = $scope.username;
        appauth.login($scope.username, $scope.password).success(function(data){
            log(data);
            $location.path('/dotmarks');
            $rootScope.user = $scope.username;
        }).error(function(){
            $scope.errors = "Login not valid";
        });
  };

  $scope.signup = function (){
        var user = $scope.username;
        appauth.signup($scope.username, $scope.password).success(function(data){
            if(data._status === 'OK'){
                // $location.path('/dotmarks');
            $rootScope.user = $scope.username;
            }
            log(data);
        }).error(function(){
            $scope.errors = "Login not valid";
        });
  };
}]);


angular.module('dotApp').controller('LogoutController',['$scope','$rootScope','AUTH_EVENTS','Session',
  function($scope, $rootScope, AUTH_EVENTS,Session){
    Session.destroy()
    return $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
}]);

angular.module('dotApp').constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

angular.module('dotApp').service('Session', ['$cookies',
  function ($cookies) {
    this.create = function (id, name){
      $cookies['id'] = id;
      $cookies['name'] = name;
    };

    this.destroy = function () {
      $cookies['id'] = null;
      $cookies['name'] = null;
    };

    this.get = function(key){
      return $cookies[key];
    }
    return this;
}]);

angular.module('dotApp').factory('AuthService', function ($http, Session) {
  return {
    login: function (credentials, callback) {
      $http
        .post('/api/accounts/login/',credentials)
        .success(function(data, status){
          Session.create(data.id,data.name);
          callback(data);
        })
        .error(function(data,status){
          callback(null);
        });
    },
    isAuthenticated: function () {
      if(Session.get('id') == 'null'){
        return null;
      }
      return Session.get('id');
    }
  };
});

angular.module('dotApp').run(function ($rootScope, AUTH_EVENTS, AuthService, Session, $location) {
  $rootScope.$on('$stateChangeStart', function (event, next, current) {
    var auth = AuthService.isAuthenticated();
    if(!auth){
      if (next.name == 'login'){
        return true;
      }
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      event.preventDefault();
    }
  });

  $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event){
    $location.path("/");
  });

  $rootScope.$on(AUTH_EVENTS.loginFailed, function(event){
    $location.path("/login/");
  });

  $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event){
    $location.path("/login/");
  });

  $rootScope.$on(AUTH_EVENTS.sessionTimeout, function(event){
    $location.path("/login/");
  });

  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(){
    $location.path("/login/");
  });

  $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event){
    $location.path("/login/");
  });

});