'use strict';

function log(entry){
    if( console && console.log ) {
            console.log(entry);
    }
}

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

var wnUrl = "http://dotmarks.dev:5000/entries";


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
