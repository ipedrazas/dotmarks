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


function processDotMarks(data) {
            var elems = new Array();
            var etags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                _.each(item.tags, function(tag) {
                    etags.push(tag.toLowerCase());
                });
             });
             $scope.dotmarks = elems;
             $scope.tags = reduce(etags);
        }

angular.module('dotApp').controller('dotMarkController', ['$scope', 'api', '$routeParams', function ($scope, api, $routeParams) {
  	$scope.refreshEntries = function(){
        api.getDotMarksEntries().success(function processDotMarks(data) {
            var elems = new Array();
            var etags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                _.each(item.tags, function(tag) {
                    etags.push(tag.toLowerCase());
                });
             });
             $scope.dotmarks = elems;
             $scope.tags = reduce(etags);
        });
    };

    $scope.getTags = function(){
        api.getDotMarksByTag($routeParams.tag).success(function (data) {
            var elems = new Array();
            var etags = new Array();
             _.each(data._items, function(item){
                elems.push(item);
                _.each(item.tags, function(tag) {
                    etags.push(tag.toLowerCase());
                });
             });
             $scope.dotmarks = elems;
             $scope.tags = reduce(etags);
        });
    };
    
    $scope.editableFocus = function(){
        log("editable tiene el foco");
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

    if($routeParams.tag !== undefined){
        $scope.getTags();  
    }else{
        $scope.refreshEntries();          
    }
    

  }]);




var dotmarksUrl = "http://dotmarks.dev:5000/dotmarks";
// var dotmarksUrl = "http://dotmarks.dev:8000/app/offline-dotmarks.json";
// var dotmarksUrl = "http://localhost:8000/app/offline-dotmarks.json";

angular.module('dotApp').factory('api', ['$http', function($http) {
    return {
        getDotMarksEntries: function() {
            return $http.get(dotmarksUrl);
        },
        saveDotMark: function(entry) {
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            return $http.post(projectUrl, entry, config);
        },
        
        getDotMarksByTag: function(tag){
             var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            var tagFilter = "?where={\"tags\": \"" + tag + "\"}";
            return $http.get(dotmarksUrl + tagFilter, config);

        },
        searchDotMarks: function(query){
            log("searching");
            var filter = "?where={\"$or\": [{\"url\":{\"$regex\":\".*" + query + ".*\"}}, {\"title\":{\"$regex\":\".*" + query + ".*\"}}]}";            
            return $http.get(dotmarksUrl + filter);
        }
    };
}]);



angular.module('dotApp').directive('typing', ['$http', function () {
    return function (scope, element, attrs) {
      element.bind('keyup', function () {
        if(element.text().length > 2){
            log(element.text());
            scope.searchDotMarks(element.text());
        }
      });
    };
  }]);
