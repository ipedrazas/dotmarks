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


angular.module('dotApp').controller('dotMarkController', ['$scope', 'api', '$routeParams', function ($scope, api, $routeParams) {
  	$scope.refreshEntries = function(){
        api.getDotMarksEntries().success(function (data) {
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

    if($routeParams.tag !== undefined){
        $scope.getTags();  
    }else{
        $scope.refreshEntries();          
    }
    

  }]);


angular.module('dotApp').controller('wnController', ['$scope', 'wnapi', '$routeParams', function ($scope, api, $routeParams) {
    var timeline;
  	$scope.refreshEntries = function(){
        api.getWNEntries().success(function (data) {
        	var elems = new Array()
        	 _.each(data._items, function(item){
        	 	item.start = (new Date(item.start)).yyyymmdd();

        	 	if(item.end){
        	 		item.end = (new Date(item.end)).yyyymmdd();
        	 	}
        	 	log(item);
        	 	elems.push(item);
        	 });
            var locale = $('*[name=language]').val();
            // var elems = [];
            timeline = new links.Timeline(document.getElementById('mytimeline'));
            var options = {
                'width':  '100%',
                'height': '300px',
                'editable': true,   // enable dragging and editing events
                'style': 'box',
                'locale': locale
            };
            timeline.draw(elems, options);
        	$scope.entries = elems;
        });
    };
    $scope.refreshEntries();

  }]);

var dotmarksUrl = "http://dotmarks.dev:5000/dotmarks";
// var dotmarksUrl = "http://dotmarks.dev:8000/app/offline-dotmarks.json";
// var dotmarksUrl = "http://localhost:8000/app/offline-dotmarks.json";
var wnUrl = "http://dotmarks.dev:5000/entries";

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

        }
    };
}]);

angular.module('dotApp').factory('wnapi', ['$http', function($http) {
    return {
        getWNEntries: function() {
            return $http.get(wnUrl);
        },
        saveDotMark: function(entry) {
            var config = {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "application/json",
            };
            return $http.post(projectUrl, entry, config);
        }
    };
}]);


angular.module('dotApp').directive('typing', function () {
    return function (scope, element, attrs) {
      element.bind('keyup', function () {
        if(element.text().length > 2){
            log(element.text());
        }
      });
    };
  });
