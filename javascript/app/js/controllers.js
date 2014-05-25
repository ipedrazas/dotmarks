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

angular.module('dotApp').controller('terminalCtl', [
    '$scope', 'api', '$routeParams', 'localStorageService',
    function ($scope, api, $routeParams, localStorageService){

    var parseResponse = function(element, count){
        log(element._status);
        if(element._status === 'OK'){
            $scope.terminal = $scope.terminal + count + " [OK] - " + element._links.self.href + "\n";
        }
        if(element._status === 'ERR'){
            $scope.terminal = $scope.terminal + count + " [FAILED] - " + element._issues.url + "\n";
        }
    };

    $scope.execute = function(){
      log($scope.terminal);
    };

    $scope.bulkImport = function(){
        var params = new Array();
        var data = $scope.terminal;
        var urls = data.split("\n");
        _.each(urls, function(el) {
          var o = {};
          o['username'] = localStorageService.get('username');
          o['url'] = el;
          params.push(o);
        });
        api.saveDotMark(JSON.stringify(params)).success(function(data){
            log(data);
            $scope.terminal = $scope.terminal + "\n\nResults:\n"
            var count = 0;
            if(data instanceof Array){
                _.each(data, function(element){
                    parseResponse(element, count++);
                });
            }else{
                parseResponse(data, count++);
            }
        });

    };

}]);




angular.module('dotApp').controller('dotMarkController',
    ['$scope', '$rootScope', '$location', 'api', 'appaudit', '$routeParams', 'localStorageService',
     function ($scope, $rootScope, $location, api, appaudit, $routeParams, localStorageService) {

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

        var pagination = {};
        pagination.last = data._links.last;
        pagination.next = data._links.next;
        pagination.prev = data._links.prev;

        $scope.pagination = pagination;
    };

    $scope.refreshEntries = function(){
        api.getDotMarksEntries($routeParams).success(callbackHandler);
    };

    $scope.getTags = function(){
        api.getDotMarksByTag($routeParams.tag).success(callbackHandler);
    };

    $scope.searchDotMarks = function(query){
        api.searchDotMarks(query).success(callbackHandler);
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

    var token = localStorageService.get('token');
    var username = localStorageService.get('username');

    if(token == undefined){
        $location.path("/signin");
    }else{
        $rootScope.currentuser = username;
    }

    if($routeParams.tag !== undefined){
        $scope.getTags();
    }else{
        $scope.refreshEntries();
    }


  }]);

angular.module('dotApp').controller('authCtl',
    ['$scope', '$rootScope','$location','appauth', 'localStorageService', 'Base64',
    function ($scope, $rootScope, $location, appauth, localStorageService, Base64){

        var authCallback = function(data){
            log(data);
            if(data._status === 'OK' || data.username == $scope.username){
                $location.path('/dotmarks');
                $rootScope.currentuser = $scope.username;
                log($scope.password);
                var token = Base64.encode($scope.username + ":" + $scope.password );
                localStorageService.clearAll();
                localStorageService.set('token', token);
                localStorageService.set('username', $scope.username);
            }else{
                $scope.errors = "Login not valid";
            }
        };

      $scope.login = function (){
            var user = $scope.username;
            appauth.login($scope.username, $scope.password).success(authCallback).error(function(){
                $scope.errors = "Login not valid";
            });
      };

      $scope.signup = function (){
            appauth.signup($scope.username, $scope.password).success(authCallback).error(function(){
                $scope.errors = "Login not valid";
            });
      };

      $scope.logout = function(){
            log('logout ' + $rootScope.currentuser);
            appauth.logout($rootScope.currentuser).success(function(data){
                log(data);
                localStorageService.clearAll();
                $rootScope.currentuser = null;
                $location.path('/signin');
            });
      }
}]);

