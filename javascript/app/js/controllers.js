'use strict';

function log(entry){
    if( console && console.log ) {
            console.log(entry);
    }
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
        	var elems = new Array()
        	 _.each(data._items, function(item){
        	 	// log(item);
        	 	// item.start = new Date(item.start);        	 	
        	 	elems.push(item);
        	 });
        	 $scope.dotmarks = elems;
        });
    };
    $scope.refreshEntries();

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


angular.module('dotApp').factory('api', ['$http', function($http) {
    var dotmarksUrl = "http://localhost:5000/dotmarks";
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
        }
    };
}]);

angular.module('dotApp').factory('wnapi', ['$http', function($http) {
    var wnUrl = "http://localhost:5000/entries";
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